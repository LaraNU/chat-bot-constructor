# Roadmap

This document is the detailed, engineering-level roadmap for evolving Chat Bot Constructor from its current
state into a production SaaS product. It is derived from a series of codebase audits and is meant to be the
source of truth for prioritization — `README.md#roadmap` contains only the summarized, phase-level version of
this document.

Product trajectory this roadmap is built against:

```text
Internal tool → Internal multi-user beta → Public beta → Self-service SaaS
```

## How to read this document

- **P0** — required before the application can be safely used by more than one trusted internal account.
- **P1** — required before opening the product to external, unsupervised users (public beta).
- **P2** — required for a credible self-service SaaS (users managing their own bots independently, analytics,
  versioned publishing).
- **P3** — scaling and advanced capabilities; valuable, but only once P0–P2 are closed.

Every item below is grounded in the current implementation, not aspirational. Nothing here proposes rewriting
working code — items either close a concrete gap or add a capability that does not exist yet.

## Guiding principles

1. **Do not migrate unhardened code.** Extracting the Telegram runtime into a separate service (P2) is
   sequenced after its security and reliability gaps (P0/P1) are closed — moving an insecure, untested runtime
   into a new service relocates the problem instead of solving it.
2. **Preserve existing architectural decisions that already fit production needs.** The per-editor Zustand
   store, the `Flow`/`FlowSnapshot` draft-vs-published separation, and the framework-agnostic
   `entities/*/server` service/repository layer are correct decisions and should be extended, not replaced.
3. **Fix the real problem, not a proxy for it.** Ownership/authorization gaps are fixed at the
   service/repository layer (the layer that will later become the backend's own authorization boundary), not
   patched ad hoc in the UI.
4. **No technology adoption for its own sake.** Backend extraction, message queues, Redis, RLS, and similar
   infrastructure are only pulled in when a specific, observed product need requires them — see
   [Explicitly deferred / not planned](#explicitly-deferred--not-planned).

---

## P0 — Production MVP (safe for internal multi-user use)

| # | Problem | Why it matters | Affected code | Complexity | Depends on | Status |
|---|---|---|---|---|---|---|
| P0.1 | Bot deletion does not verify the requester owns the bot | Any authenticated user can delete another user's bot | `entities/bot/api/actions.ts`, `entities/bot/server/{repository,service}.ts` | S | — | Done |
| P0.2 | Workflow save does not verify bot ownership | Any authenticated user can overwrite another user's workflow | `entities/workflow/api/actions.ts`, `entities/workflow/server/service.ts` | M | P0.1 (shared ownership helper) | Done |
| P0.3 | Editor page loads a bot/workflow by id without an ownership check | Cross-user data (including the bot's Telegram token) can be read via the editor URL | `app/[locale]/editor/[id]/page.tsx`, `entities/bot/server/service.ts` | M | P0.1 | Done |
| P0.4 | A single `assertBotOwnership(userId, botId)` helper does not exist | Ownership logic is duplicated/inconsistent across actions; new mutations risk repeating the same gap | `entities/bot/server/*`, `entities/workflow/server/*` | M | P0.1, P0.2 | Done |
| P0.5 | Telegram webhook does not validate `X-Telegram-Bot-Api-Secret-Token`; the bot token travels in the webhook URL query string and is not cross-checked against the database | A party who learns the webhook URL can send arbitrary updates as if from Telegram, or replay the token | `features/telegram-webhook/api/controller.ts`, `features/publish-bot/lib/telegram.ts` | M | — | Done |
| P0.6 | No index on `Bot.userId` | Bot listing degrades as the table grows | `prisma/schema.prisma` + migration | S | — | Done |
| P0.7 | No automated tests for the execution engine, webhook controller, or node handlers | This is the code path that talks to real Telegram users; regressions here are high-impact and currently invisible until reported by a user | `features/telegram-webhook/**` | M | — | Done |
| P0.8 | CI's "Install dependencies" step is a malformed multi-line YAML value that runs `npm install npm ci` as one command instead of `npm install` and `npm ci` separately | CI does not perform the reproducible install it appears to perform | `.github/workflows/ci.yml` | S | — | Done |
| P0.9 | No `error.tsx` / `global-error.tsx` in the App Router | Unhandled render errors produce the default Next.js error screen instead of a controlled UX | `src/app/[locale]/` | S | — | Done |

## P1 — Public Beta readiness

| # | Problem | Why it matters | Affected code | Complexity | Depends on | Status |
|---|---|---|---|---|---|---|
| P1.1 | No idempotency handling for Telegram updates (`update_id` is not tracked) | Telegram retries (e.g. after a 500) can cause a conversation step or side effect to run twice | `features/telegram-webhook/lib/session.ts`, `model/types.ts`, `api/controller.ts` | M | — | Done |
| P1.2 | No rate limiting anywhere in the application | Auth, publish, delete, and the webhook are all open to abuse at any volume | `src/middleware.ts` or a dedicated layer | M | P0.5 (webhook hardening first) | — |
| P1.3 | No structured logging or error monitoring (only ad hoc `console.error`) | Operational issues are invisible until a user reports them; the webhook already swallows most errors as `{ success: true }` | Project-wide, starting with `features/telegram-webhook` | M | — | — |
| P1.4 | `src/middleware.ts` gates protected routes by checking for a cookie name containing `auth-token`, not by validating the session | False sense of route protection at the middleware layer (pages are still protected server-side via `requireAuthenticatedUser()`) | `src/middleware.ts` | S | — | — |
| P1.5 | No autosave; `isDirty` is set to `true` on any `onNodesChange`, including selection/drag, not just data changes | Manual-save-only UX does not scale to unsupervised external users; false-positive dirty state blocks publishing unnecessarily | `entities/workflow/model/store/workflow-store.ts`, `features/save-workflow` | M | — | — |
| P1.6 | `Bot.token` is stored in plaintext | A database read exposes every bot's Telegram token directly | `prisma/schema.prisma`, `entities/bot/server` | M | — | — |
| P1.7 | `BotResponse` has no foreign key to `Bot` | Deleting a bot leaves orphaned response rows; cannot safely join responses to their owning bot | `prisma/schema.prisma` + migration | S | — | — |
| P1.8 | `src/features/workflow-actions` is dead code (not imported anywhere in `src`) that duplicates store responsibilities | Ambiguity for future contributors about which mutation API is authoritative | `src/features/workflow-actions/**` | S | — | — |
| P1.9 | No deployment manifest (Dockerfile, docker-compose, or equivalent) in the repository | Deployment is not reproducible from the repository | Repository root | M | — | — |
| P1.10 | No basic security headers configured (`next.config.ts` sets no `headers()`) | Missing baseline protections (e.g. `X-Frame-Options`, `Content-Security-Policy`) | `next.config.ts` | S | — | — |
| P1.11 | No end-to-end tests for save, publish, or webhook flows (Playwright currently covers only auth and bot creation) | The most business-critical user flows have no regression safety net | `tests/` | M | P0.7 | — |
| P1.12 | `answerCallbackQuery` is never called after a `choice` node's inline button is pressed | Telegram shows a persistent loading state on the button for the end user | `features/telegram-webhook/lib/nodes/choice-handler.ts` | S | — | — |

## P2 — Self-service SaaS

| # | Problem | Why it matters | Affected code | Complexity | Depends on |
|---|---|---|---|---|---|
| P2.1 | Publishing does not keep history — `FlowSnapshot` is a single upsert row per `Flow` | Self-service users will expect to roll back a bad publish; there is currently no way to do so, nor is there an "unpublish" action | `prisma/schema.prisma`, `entities/workflow/server`, `features/publish-bot` | M | P1 items closed (this changes the same write path that must first be secure) |
| P2.2 | The Telegram runtime runs inside the same process/deployment as the frontend | Runtime load and frontend load cannot be scaled or operated independently | `features/telegram-webhook/**` → new service | L | P0.5, P0.7, P1.1, P1.3 (must be secure, tested, and observable before extraction) |
| P2.3 | There is no documented REST API — all mutations go through Next.js Server Actions | No integration surface for future clients (mobile, third-party, public API) | New layer on top of `entities/*/server/service.ts` | L | Can start in parallel with P2.2, reusing the same domain layer |
| P2.4 | Collected bot response data (`BotResponse`) has no UI or API to view it | The product cannot yet deliver on "view bot usage analytics" from the stated product goals, despite already collecting the data | New feature on top of `entities/bot`/`entities/workflow` server layer | M | P1.7 (FK must exist before building reliable joins/aggregations) |
| P2.5 | No application-level encryption for `Bot.token` beyond the P1.6 fix | Centralizing secret handling is more natural once a dedicated backend service exists | `entities/bot/server`, future backend service | M | P2.2 |
| P2.6 | No metrics, tracing, or health-check endpoint | Once a second service exists (P2.2), there is no way to monitor its health independently | New backend service | M | P2.2 |

## P3 — Scaling and advanced capabilities

| # | Problem | Why it matters | Affected code | Complexity | Depends on |
|---|---|---|---|---|---|
| P3.1 | Long node chains execute synchronously within a single webhook request, with no queue | Long conversations could approach serverless/platform request timeouts | `features/telegram-webhook/lib/engine.ts` | L | P2.2; only pursue if real usage data shows this is a problem |
| P3.2 | No team/role model — a bot has exactly one owning `userId` | Needed only if the product targets teams sharing bot ownership, not solo users | `prisma/schema.prisma`, ownership checks across the codebase | L | A `User` model decision |
| P3.3 | No undo/redo, copy/paste, or keyboard shortcuts in the workflow editor | Editor UX polish; does not affect production readiness or backend architecture | `entities/workflow/model/store`, `widgets/workflow-canvas` | L | — |
| P3.4 | No public API for third-party integrations | Only relevant once there is external demand for programmatic access | Built on top of P2.3 | L | P2.3 |
| P3.5 | Condition/Summary nodes subscribe to the entire React Flow node array instead of a narrow selector | Unnecessary re-renders on large graphs (hundreds of nodes) | `entities/workflow/ui/nodes/condition-node.tsx`, `summary-node.tsx` | M | — |

---

## Dependency graph (cross-tier)

```text
P0.1 ─┬─► P0.2 ─► P0.3 ─► P0.4 (shared ownership helper)
      │
P0.5 (webhook secret) ──► P1.2 (rate limiting should follow, not precede, webhook hardening)
P0.7 (runtime tests) ──┬─► P1.11 (E2E on publish/save/webhook)
                        └─► P2.2 (backend extraction — must not migrate untested code)
P1.1 (idempotency) ────────► P2.2
P1.3 (structured logging) ─► P2.2, P2.6
P1.7 (BotResponse FK) ─────► P2.4 (analytics)
P1 (all security/reliability items) ─► P2.1 (publish history touches the same write path)
P2.2 (backend extraction) ─┬─► P2.5 (centralized secret handling)
                             └─► P2.6 (per-service observability)
P2.3 (REST API) ───────────► P3.4 (public API for third parties)
```

The single hard rule encoded above: **P2.2 (backend extraction) must not start before P0.5, P0.7, P1.1, and
P1.3 are done.** Everything else can be reordered based on product priority within its tier.

---

## Roadmap by domain

### Frontend
- Fix `isDirty` semantics (P1.5); add autosave.
- Remove dead `workflow-actions` feature (P1.8).
- Narrow Zustand/React Flow subscriptions on Condition/Summary nodes (P3.5).
- `error.tsx` / `global-error.tsx` (P0.9).
- Editor UX polish — undo/redo, copy/paste, shortcuts (P3.3) — intentionally last.

### Backend
- Introduce `assertBotOwnership` at the service layer (P0.4) — designed so it becomes the backend's own
  authorization boundary later, not a UI-only patch.
- Keep all new business logic inside `entities/*/server/{service,repository}.ts`, free of Next.js-specific APIs
  (`headers()`, `revalidatePath`, cookies) — this is what keeps P2.2/P2.3 an incremental migration.
- Extract the Telegram runtime into a standalone Node.js service (P2.2), then a documented REST API for
  bot/workflow operations (P2.3).

### Database
- Index on `Bot.userId` (P0.6); FK from `BotResponse` to `Bot` (P1.7).
- Encrypt `Bot.token` at rest (P1.6), revisit centralization once a backend service exists (P2.5).
- Model publish history instead of a single `FlowSnapshot` upsert (P2.1).

### Telegram Runtime
- Webhook secret-token validation, remove the token from the webhook URL (P0.5).
- Tests for `engine.ts`, `controller.ts`, and every node handler (P0.7).
- Idempotency via `update_id` (P1.1); `answerCallbackQuery` (P1.12).
- Extraction into a dedicated service (P2.2), only after the above are done.

### Security
- Close all ownership/authorization gaps (P0.1–P0.4) — the single highest-priority item in this roadmap.
- Webhook security (P0.5).
- Rate limiting (P1.2), security headers (P1.10), real session validation in middleware (P1.4).
- Token encryption (P1.6 → P2.5).

### Testing
- Runtime engine/controller/handler tests (P0.7).
- E2E coverage for save/publish/webhook flows (P1.11).
- `tsc --noEmit` as an explicit CI step alongside the existing lint/test/build/e2e pipeline.

### Deployment / DevOps
- Fix the CI install-step defect (P0.8).
- Add a Dockerfile / deployment manifest (P1.9).
- Add health checks and per-service monitoring once a second service exists (P2.6).

### Analytics
- Do not build any UI before P1.7 (FK integrity) is in place.
- Start with a simple per-bot list of collected responses; only build aggregation/dashboards (P2.4 extended)
  once the simple view is validated with real usage.

---

## Explicitly deferred / not planned

These are intentionally excluded from P0–P2 because they solve problems the product does not yet have. Revisit
only if a concrete, observed need appears:

- **Message queues / async job processing** for workflow execution — the current synchronous per-request
  execution model has no demonstrated scaling problem yet (P3.1 tracks revisiting this with real data).
- **Postgres Row Level Security** — all data access goes through Prisma with a single service role; there is no
  direct client-to-database access that RLS would protect.
- **Microservices beyond "frontend + one backend runtime service"** — unjustified at the current product scope.
- **Kubernetes** — a managed platform (e.g. a single container host) is sufficient for the target scale; this
  would be infrastructure added for its own sake, not for a product need.
- **GraphQL** — no over-fetching/under-fetching problem exists to justify it over REST.
