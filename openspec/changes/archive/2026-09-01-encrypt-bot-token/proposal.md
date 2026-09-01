## Why

`Bot.token` is stored as plaintext in the database. If the database or backups are compromised, all Telegram bot tokens are immediately exposed. Additionally, the token is currently passed through the RSC payload to the client, making it visible in the network tab and React DevTools. This is a P1 security fix for a production SaaS.

## What Changes

- `Bot.token` is stored encrypted using AES-256-GCM with a server-side `BOT_TOKEN_ENCRYPTION_KEY` env variable.
- Plaintext token is never returned to the client: removed from RSC props and Server Action responses.
- `initialToken` prop is removed from `EditorPage`, `WorkflowEditorPage`, and `PublishBotButton`.
- Publish dialog UX changes: if a token is already stored, show "Publish" confirmation without a token input field; if no token is stored, show the token input field (first publish). An "Update token" option is kept as P2.
- A one-time migration script (`scripts/encrypt-tokens.ts`) encrypts existing plaintext tokens in the database; idempotent (skips already-encrypted rows using `enc:v1:` prefix).
- `encryptToken` / `decryptToken` utilities added to `shared/lib/crypto`.
- All server-side consumers of `bot.token` (`publishBotAction`, webhook `controller.ts`, `assertBotOwnership`) decrypt on demand, never expose plaintext to the client.

## Capabilities

### New Capabilities

- `bot-token-security`: Encryption at rest for `Bot.token`, secure token flow from storage through server-side Telegram API calls, and UX for first-publish vs. re-publish flows.

### Modified Capabilities

(none — no existing spec covers token storage or publish dialog behavior)

## Impact

- **`prisma/schema.prisma`**: No schema change needed; `token` field remains `String?`. The stored value changes format from plaintext to `enc:v1:<nonce>.<ciphertext+tag>`.
- **`src/entities/bot/server/service.ts`**: `assertBotOwnership` returns `Bot` with encrypted token; callers must not pass `bot.token` to the client.
- **`src/entities/bot/server/repository.ts`**: `createBot` / `updateBotToken` encrypt before write; `getBotById` returns raw (still encrypted) record.
- **`src/features/publish-bot/api/actions.ts`**: `publishBotAction` — when token provided, encrypts and saves; when not provided, reads and decrypts from DB.
- **`src/features/publish-bot/model/use-publish-bot.ts`**: Removes `initialToken` usage; dialog opens in "confirm" mode if token exists server-side.
- **`src/features/publish-bot/ui/publish-button.tsx`**: Removes `initialToken` prop and token input when bot already has a token.
- **`src/features/telegram-webhook/api/controller.ts`**: Decrypts token before using it.
- **`src/app/[locale]/editor/[id]/page.tsx`**: Removes `initialToken` from props passed to `WorkflowEditorPage`.
- **`src/views/workflow-editor`**: Removes `initialToken` prop chain.
- **`src/shared/lib/crypto/`**: New module with `encryptToken` / `decryptToken`.
- **`scripts/encrypt-tokens.ts`**: One-time migration script.
- **`.env.example`**: Add `BOT_TOKEN_ENCRYPTION_KEY` documentation.
