## Context

See `proposal.md – Why` for motivation.

`Bot.token` is currently a `String?` in Prisma schema, stored as plaintext. It passes through the RSC prop chain from `EditorPage` → `WorkflowEditorPage` → `PublishBotButton`, which means the token is serialized into the RSC payload (visible in the network tab and React DevTools). The Prisma schema column type does not need to change — only the stored value format changes.

## Goals / Non-Goals

**Goals:**
- Encrypt `Bot.token` at rest using AES-256-GCM.
- Remove `initialToken` from all RSC props and client-side state.
- Make the publish dialog context-aware: confirmation flow when token exists, input flow when it does not.
- Provide an idempotent one-time migration script.
- Fail fast on missing or malformed `BOT_TOKEN_ENCRYPTION_KEY`.

**Non-Goals:**
- Key rotation automation (P2 — the `enc:v1:` prefix scheme makes it possible later without breaking changes).
- Showing the "Update token" button in the re-publish dialog (P2).
- Column-level encryption at the DB/Prisma driver level (unnecessary complexity for this threat model).
- Audit logging of token access.

## Decisions

### D1: AES-256-GCM via Node.js built-in `crypto`

**Decision:** Use Node.js `crypto` module directly (`createCipheriv` / `createDecipheriv`) with AES-256-GCM.

**Rationale:** No external dependency needed. AES-GCM provides both confidentiality and integrity (the 16-byte auth tag detects tampering or key mismatch at decrypt time). The 256-bit key matches the standard for secrets-at-rest.

**Alternative considered:** `libsodium` / `tweetnacl`. Adds a dependency; the threat model does not justify it over the built-in.

---

### D2: Format `enc:v1:<base64-nonce>.<base64-ciphertext+authTag>`

**Decision:** Store encrypted tokens as a self-describing string with a version prefix.

**Rationale:**
- `enc:v1:` prefix allows the migration script to skip already-encrypted rows (idempotence).
- Version suffix enables future algorithm upgrades (`enc:v2:...`) without a full re-encryption.
- Single column, no schema migration required.
- 12-byte random nonce per encryption (GCM best practice); nonce collision probability is negligible at the scale of this product.

**Alternative considered:** Separate `token_nonce` column. Avoids base64 parsing overhead but requires a Prisma migration and complicates the repository layer.

---

### D3: Decrypt on-demand in server-side consumers, not at repository boundary

**Decision:** `botRepository` returns the raw (encrypted) string. Each consumer (`publishBotAction`, webhook `controller.ts`) calls `decryptToken()` immediately before use.

**Rationale:** The repository should not assume the calling context always needs a plaintext token (e.g., `assertBotOwnership` checks ownership, not token content). Decrypting only where the plaintext is actually needed minimizes the window where the sensitive value is in memory.

**Alternative considered:** Decrypt in `getBotById`. Simpler call sites but leaks decrypted value into all `Bot` objects regardless of whether the caller needs it; raises risk of accidental serialization.

---

### D4: Publish dialog — server-side `hasToken` boolean instead of passing the token

**Decision:** `EditorPage` fetches `bot.token !== null` and passes a `hasToken: boolean` prop (not the token itself) to `WorkflowEditorPage` / `PublishBotButton`.

**Rationale:** The client only needs to know whether a token is stored to decide which dialog variant to render. A boolean is safe to include in the RSC payload; the encrypted string is not (even though it cannot be decrypted client-side, it is unnecessary data and violates the principle of minimum exposure).

`publishBotAction` receives `{ botId, token?: string }`:
- If `token` is provided → encrypt and upsert, then register webhook.
- If `token` is omitted → read encrypted token from DB, decrypt, register webhook.

---

### D5: Migration script as a standalone TypeScript file

**Decision:** `scripts/encrypt-tokens.ts`, runnable via `npx tsx scripts/encrypt-tokens.ts`.

**Rationale:** Prisma migrations are DDL changes only. Data transformation must happen outside Prisma migrate. A standalone script is explicit, auditable, and can be committed alongside the feature. Idempotence is enforced by the `enc:v1:` prefix check.

**Deployment order:**
1. Deploy new code (supports both plaintext and `enc:v1:` reads — `decryptToken` detects the prefix and handles both during the transition window).
2. Run migration script.
3. Remove plaintext-read fallback in a follow-up PR (optional cleanup).

## Risks / Trade-offs

- **`BOT_TOKEN_ENCRYPTION_KEY` loss** → All stored tokens become unrecoverable. Mitigation: document the key as a critical secret; include in `.env.example` with a generation command. Recommend storing in a secrets manager (Vercel, Doppler) rather than `.env`.
- **Migration window** → Between deploy and script execution, new tokens are encrypted but old tokens are still plaintext. The decrypt utility must handle both formats. This window should be minutes, not hours.
- **GCM nonce reuse** → Reusing a nonce with the same key breaks AES-GCM security. Mitigation: always generate a fresh `randomBytes(12)` per encryption call (enforced in the utility).

## Migration Plan

1. Add `BOT_TOKEN_ENCRYPTION_KEY` to production environment (64 hex chars, 32 bytes). Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
2. Deploy the application code (new `shared/lib/crypto`, updated actions, updated publish dialog).
3. Run `npx tsx scripts/encrypt-tokens.ts` against production DB.
4. Verify: spot-check a bot token in DB starts with `enc:v1:`; confirm publish still works end-to-end.

**Rollback:** Not straightforward — once tokens are encrypted, reverting to code that reads plaintext breaks all published bots. Keep the rollback window to the period between step 2 and step 3 (no irreversible change until the script runs).
