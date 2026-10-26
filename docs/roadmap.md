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

| #    | Problem                                                                                                                                                                   | Why it matters                                                                                                                             | Affected code                                                                         | Complexity | Depends on                     | Status |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ---------- | ------------------------------ | ------ |
| P0.1 | Bot deletion does not verify the requester owns the bot                                                                                                                   | Any authenticated user can delete another user's bot                                                                                       | `entities/bot/api/actions.ts`, `entities/bot/server/{repository,service}.ts`          | S          | —                              | Done   |
| P0.2 | Workflow save does not verify bot ownership                                                                                                                               | Any authenticated user can overwrite another user's workflow                                                                               | `entities/workflow/api/actions.ts`, `entities/workflow/server/service.ts`             | M          | P0.1 (shared ownership helper) | Done   |
| P0.3 | Editor page loads a bot/workflow by id without an ownership check                                                                                                         | Cross-user data (including the bot's Telegram token) can be read via the editor URL                                                        | `app/[locale]/editor/[id]/page.tsx`, `entities/bot/server/service.ts`                 | M          | P0.1                           | Done   |
| P0.4 | A single `assertBotOwnership(userId, botId)` helper does not exist                                                                                                        | Ownership logic is duplicated/inconsistent across actions; new mutations risk repeating the same gap                                       | `entities/bot/server/*`, `entities/workflow/server/*`                                 | M          | P0.1, P0.2                     | Done   |
| P0.5 | Telegram webhook does not validate `X-Telegram-Bot-Api-Secret-Token`; the bot token travels in the webhook URL query string and is not cross-checked against the database | A party who learns the webhook URL can send arbitrary updates as if from Telegram, or replay the token                                     | `features/telegram-webhook/api/controller.ts`, `features/publish-bot/lib/telegram.ts` | M          | —                              | Done   |
| P0.6 | No index on `Bot.userId`                                                                                                                                                  | Bot listing degrades as the table grows                                                                                                    | `prisma/schema.prisma` + migration                                                    | S          | —                              | Done   |
| P0.7 | No automated tests for the execution engine, webhook controller, or node handlers                                                                                         | This is the code path that talks to real Telegram users; regressions here are high-impact and currently invisible until reported by a user | `features/telegram-webhook/**`                                                        | M          | —                              | Done   |
| P0.8 | CI's "Install dependencies" step is a malformed multi-line YAML value that runs `npm install npm ci` as one command instead of `npm install` and `npm ci` separately      | CI does not perform the reproducible install it appears to perform                                                                         | `.github/workflows/ci.yml`                                                            | S          | —                              | Done   |
| P0.9 | No `error.tsx` / `global-error.tsx` in the App Router                                                                                                                     | Unhandled render errors produce the default Next.js error screen instead of a controlled UX                                                | `src/app/[locale]/`                                                                   | S          | —                              | Done   |

## P1 — Public Beta readiness

| #     | Problem                                                                                                                                                                                                                      | Why it matters                                                                                                                                                           | Affected code                                                                                                                                                                                  | Complexity | Depends on                                  | Status |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------- | ------ |
| P1.1  | No idempotency handling for Telegram updates (`update_id` is not tracked)                                                                                                                                                    | Telegram retries (e.g. after a 500) can cause a conversation step or side effect to run twice                                                                            | `features/telegram-webhook/lib/session.ts`, `model/types.ts`, `api/controller.ts`                                                                                                              | M          | —                                           | Done   |
| P1.2  | No rate limiting anywhere in the application                                                                                                                                                                                 | Auth, publish, delete, and the webhook are all open to abuse at any volume                                                                                               | `shared/lib/rate-limit/**`, Server Actions (`publishBotAction`, `deleteBotAction`), `features/telegram-webhook/api/controller.ts`; auth via Supabase Auth rate limits (not Next.js middleware) | M          | P0.5 (webhook hardening first)              | Done   |
| P1.3  | No structured logging or error monitoring (only ad hoc `console.error`)                                                                                                                                                      | Operational issues are invisible until a user reports them; the webhook already swallows most errors as `{ success: true }`                                              | Project-wide, starting with `features/telegram-webhook`                                                                                                                                        | M          | —                                           | —      |
| P1.4  | `src/middleware.ts` gates protected routes by checking for a cookie name containing `auth-token`, not by validating the session                                                                                              | False sense of route protection at the middleware layer (pages are still protected server-side via `requireAuthenticatedUser()`)                                         | `src/middleware.ts`                                                                                                                                                                            | S          | —                                           | Done   |
| P1.5  | No autosave; `isDirty` is set to `true` on any `onNodesChange`, including selection/drag, not just data changes                                                                                                              | Manual-save-only UX does not scale to unsupervised external users; false-positive dirty state blocks publishing unnecessarily                                            | `entities/workflow/model/store/workflow-store.ts`, `features/save-workflow`                                                                                                                    | M          | —                                           | Done   |
| P1.6  | `Bot.token` is stored in plaintext                                                                                                                                                                                           | A database read exposes every bot's Telegram token directly                                                                                                              | `prisma/schema.prisma`, `entities/bot/server`                                                                                                                                                  | M          | —                                           | Done   |
| P1.7  | `BotResponse` has no foreign key to `Bot`                                                                                                                                                                                    | Deleting a bot leaves orphaned response rows; cannot safely join responses to their owning bot                                                                           | `prisma/schema.prisma` + migration                                                                                                                                                             | S          | —                                           | —      |
| P1.8  | `src/features/workflow-actions` is dead code (not imported anywhere in `src`) that duplicates store responsibilities                                                                                                         | Ambiguity for future contributors about which mutation API is authoritative                                                                                              | `src/features/workflow-actions/**`                                                                                                                                                             | S          | —                                           | —      |
| P1.9  | No deployment manifest (Dockerfile, docker-compose, or equivalent) in the repository                                                                                                                                         | Deployment is not reproducible from the repository                                                                                                                       | Repository root                                                                                                                                                                                | M          | —                                           | —      |
| P1.10 | No basic security headers configured (`next.config.ts` sets no `headers()`)                                                                                                                                                  | Missing baseline protections (e.g. `X-Frame-Options`, `Content-Security-Policy`)                                                                                         | `next.config.ts`                                                                                                                                                                               | S          | —                                           | Done   |
| P1.11 | No end-to-end tests for save, publish, or webhook flows (Playwright currently covers only auth and bot creation)                                                                                                             | The most business-critical user flows have no regression safety net                                                                                                      | `tests/`                                                                                                                                                                                       | M          | P0.7                                        | —      |
| P1.12 | `answerCallbackQuery` is never called after a `choice` node's inline button is pressed                                                                                                                                       | Telegram shows a persistent loading state on the button for the end user                                                                                                 | `features/telegram-webhook/lib/nodes/choice-handler.ts`                                                                                                                                        | S          | —                                           | —      |
| P1.13 | The execution engine has no step limit, and neither validation nor the canvas (`isValidConnection` is not set) prevents cycles without a waiting node (e.g. `message A → message B → message A`)                             | A single published cycle makes the bot send messages in a loop until the serverless function times out — spamming end users, risking a Telegram ban, and burning compute | `features/telegram-webhook/lib/engine.ts`, `entities/workflow/lib/validation/validate-graph-structure.ts`, `widgets/workflow-canvas`                                                           | S          | —                                           | Done   |
| P1.14 | `publishBotAction` does not validate the workflow server-side — `validateWorkflow` runs only in the client hooks, and the draft schema stores node `data` as `z.record(unknown)`                                             | Calling the Server Action directly publishes an arbitrary JSON graph into `FlowSnapshot`; the runtime then executes data of any shape                                    | `features/publish-bot/api/actions.ts`, `entities/workflow/model/validation.ts`                                                                                                                 | S          | —                                           | —      |
| P1.15 | Outgoing messages use `parse_mode: 'HTML'` without escaping author text or end-user answers (interpolated by `summary`)                                                                                                      | An answer such as `a<b` or `&` makes Telegram return 400, the engine throws, and the dialog gets stuck (see P1.16); it is also an HTML-injection vector                  | `shared/api/telegram/client.ts`, `features/telegram-webhook/lib/nodes/summary-handler.ts`                                                                                                      | S          | —                                           | —      |
| P1.16 | Any runtime exception is swallowed as `{ success: true }`: `saveUserSession` is skipped and the end user receives nothing                                                                                                    | End users get stuck mid-dialog with `/start` as the only way out, and the bot owner is never told                                                                        | `features/telegram-webhook/api/controller.ts`                                                                                                                                                  | M          | P1.3 (failures must at least be observable) | —      |
| P1.17 | `choice-handler` throws when the session waits for a button press but receives a text message or a press on a button from an older message                                                                                   | The most common end-user behavior breaks the dialog (same failure mode as P1.16)                                                                                         | `features/telegram-webhook/lib/nodes/choice-handler.ts`                                                                                                                                        | S          | Ship together with P1.12                    | —      |
| P1.18 | The rate limiter is in-memory, so on serverless every isolate keeps its own counters; `createBotAction` and `saveWorkflowAction` are not rate-limited at all; there are no per-user quotas (bots, nodes, graph payload size) | No effective protection against database spam at public-beta scale; a hard prerequisite for guest mode (P2.13)                                                           | `shared/lib/rate-limit/**`, `entities/bot/api/actions.ts`, `entities/workflow/api/actions.ts`                                                                                                  | M          | P1.2                                        | —      |
| P1.19 | Deleting a bot does not call Telegram `deleteWebhook`; the webhook then answers `500` for the deleted bot                                                                                                                    | Telegram keeps redelivering updates to a dead endpoint, and the token stays bound to our URL                                                                             | `entities/bot/api/actions.ts`, `features/telegram-webhook/api/controller.ts`                                                                                                                   | S          | —                                           | —      |
| P1.20 | The webhook URL passed to `setWebhook` is built from the request `Host` header instead of a configured `APP_URL`                                                                                                             | Preview deployments register production bots' webhooks to themselves, and the webhook target depends on a client-supplied header                                         | `features/publish-bot/api/actions.ts`                                                                                                                                                          | S          | —                                           | —      |
| P1.21 | No Privacy Policy, Terms of Service, or end-user data deletion procedure, although `BotResponse` stores end users' personal data (names, phones, free-text answers)                                                          | Legal blocker for a commercial SaaS (152-FZ for Russian users, GDPR for EU users)                                                                                        | Product/legal pages, data-retention process                                                                                                                                                    | M          | P1.7                                        | —      |
| P1.22 | The same Telegram token can be attached to several bots                                                                                                                                                                      | The last publish silently takes over the webhook, and the earlier bot stops working without any error                                                                    | `features/publish-bot`, `entities/bot/server`                                                                                                                                                  | S          | —                                           | —      |

## P2 — Self-service SaaS

| #    | Problem                                                                                                                                        | Why it matters                                                                                                                    | Affected code                                                               | Complexity | Depends on                                                                        |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| P2.1 | Publishing does not keep history — `FlowSnapshot` is a single upsert row per `Flow`                                                            | Self-service users will expect to roll back a bad publish; there is currently no way to do so, nor is there an "unpublish" action | `prisma/schema.prisma`, `entities/workflow/server`, `features/publish-bot`  | M          | P1 items closed (this changes the same write path that must first be secure)      |
| P2.2 | The Telegram runtime runs inside the same process/deployment as the frontend                                                                   | Runtime load and frontend load cannot be scaled or operated independently                                                         | `features/telegram-webhook/**` → new service                                | L          | P0.5, P0.7, P1.1, P1.3 (must be secure, tested, and observable before extraction) |
| P2.3 | There is no documented REST API — all mutations go through Next.js Server Actions                                                              | No integration surface for future clients (mobile, third-party, public API)                                                       | New layer on top of `entities/*/server/service.ts`                          | L          | Can start in parallel with P2.2, reusing the same domain layer                    |
| P2.4 | Collected bot response data (`BotResponse`) has no UI or API to view it                                                                        | The product cannot yet deliver on "view bot usage analytics" from the stated product goals, despite already collecting the data   | New feature on top of `entities/bot`/`entities/workflow` server layer       | M          | P1.7 (FK must exist before building reliable joins/aggregations)                  |
| P2.5 | No application-level encryption for `Bot.token` beyond the P1.6 fix                                                                            | Centralizing secret handling is more natural once a dedicated backend service exists                                              | `entities/bot/server`, future backend service                               | M          | P2.2                                                                              |
| P2.6 | No metrics, tracing, or health-check endpoint                                                                                                  | Once a second service exists (P2.2), there is no way to monitor its health independently                                          | New backend service                                                         | M          | P2.2                                                                              |
| P2.7 | Two quick updates from the same chat can race on `UserSession` (lost update), and Telegram `429` responses (~30 msg/s per bot) are not retried | Dialog state can be overwritten under real traffic; bursts silently drop messages                                                 | `features/telegram-webhook/lib/session.ts`, `shared/api/telegram/client.ts` | M          | P1.3                                                                              |

### P2 — Product track: ease of use and reach

The items below make the product easier to understand and usable by a wider audience. They extend existing
code instead of adding parallel implementations: the engine refactor (P2.8) evolves the node-handler registry,
templates (P2.10) evolve `createDefaultFlow`, and guest mode (P2.13) adds a persistence adapter next to
`useAutosave` instead of a second editor.

| #     | Problem                                                                                                                                                                                                      | Why it matters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Affected code                                                                                                        | Complexity | Depends on                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| P2.8  | Node handlers call `sendTelegramMessage` and `prisma` directly, so the engine is coupled to Telegram and the database                                                                                        | The same graph cannot run anywhere else (preview, other messengers), and tests need fetch/Prisma mocks. Target: a pure engine whose handlers return effects (`sendMessage`, `saveResponse`, `waitForInput`), executed by a `TelegramTransport` or an `EmulatorTransport`; the engine moves to a Node-free location (e.g. `entities/workflow/lib/runtime`)                                                                                                                                              | `features/telegram-webhook/lib/**`                                                                                   | M          | P0.7                                                                    |
| P2.9  | Users cannot see how the bot behaves before publishing — doing that requires a BotFather token and a live publish                                                                                            | The biggest comprehension barrier for new users. Target: a client-side Telegram-style chat emulator in the editor that runs the pure engine on the current draft and highlights the active node on the canvas                                                                                                                                                                                                                                                                                          | `widgets/*` (new emulator widget), `entities/workflow/lib/runtime`                                                   | M          | P2.8, P1.15 (shared formatting/escaping, so preview matches production) |
| P2.10 | A new bot starts with only a `start` node, so users do not know what to add or connect next                                                                                                                  | Empty-canvas drop-off. Target: a template registry (`createFlowFromTemplate`) — blank, welcome + menu, lead form, branching survey, FAQ — chosen in `CreateBotModal`, with instructional placeholder texts and a three-step coach-mark tour                                                                                                                                                                                                                                                            | `entities/workflow/model/create-default-flow.ts`, `features/create-bot`                                              | M          | —                                                                       |
| P2.11 | The canvas allows graphs the engine ignores (several outgoing edges from linear nodes — the engine takes only `[0]`); validation errors are not highlighted on the canvas; hardcoded colors break dark theme | The graph shows logic that does not actually exist; users find errors only when publishing                                                                                                                                                                                                                                                                                                                                                                                                             | `widgets/workflow-canvas`, `widgets/editor-header/ui/editor-header.tsx`, `entities/workflow/ui/edge/custom-edge.tsx` | M          | P1.13                                                                   |
| P2.12 | The publish flow has only a text hint about BotFather: no step-by-step guide or deep link, no `getMe` check, no bot link or QR code after publishing                                                         | Failed or confusing first publishes; users cannot find their bot after publishing                                                                                                                                                                                                                                                                                                                                                                                                                      | `features/publish-bot`                                                                                               | S          | P1.22                                                                   |
| P2.13 | Only signed-in users can build bots                                                                                                                                                                          | High-friction entry from the landing page. Target: local-first guest mode — the draft lives in IndexedDB/localStorage, the emulator works without an account, and registration is requested on save/publish, then the draft is imported via `createBot` + `saveWorkflow` with strict server-side validation. Chosen over Supabase anonymous sign-in because it creates no guest rows in the database before distributed rate limiting exists                                                           | `features/save-workflow` (persistence adapter), `views/workflow-editor`, landing CTA                                 | L          | P1.14, P1.18, P2.9, P2.10                                               |
| P2.14 | Text capabilities are minimal: no formatting editor, `{{label}}` variables exist only in `summary`, no length counters                                                                                       | Bots look plain, and personalisation is hidden. Target: a formatting editor (bold, italic, link, code, spoiler, blockquote), shared variable interpolation for all text nodes (`{{first_name}}`, `{{username}}`, answers) with a variable picker, and counters for Telegram limits (4096 text / 1024 caption)                                                                                                                                                                                          | `entities/workflow/ui`, `widgets/properties-panel`, runtime formatting utility                                       | M          | P1.15, P2.8                                                             |
| P2.15 | The node set covers only basic dialogs                                                                                                                                                                       | Common use cases (lead forms, bookings) are not possible. Batch 1: answer validation in `question` (email/phone/number/regex + retry text); URL buttons; reply keyboard with `request_contact` / `request_location`; owner notification node (forward collected answers to an admin chat); extended `condition` (not equals, case-insensitive, numeric compare, branch on a selected button); remove buttons after a press (`editMessageReplyMarkup`); `setMyCommands` / `setMyDescription` on publish | `entities/workflow/model`, `features/telegram-webhook/lib/nodes`, `widgets/properties-panel`                         | L          | P2.8                                                                    |
| P2.16 | Bots cannot open Telegram Mini Apps                                                                                                                                                                          | Mini Apps are a native part of Telegram bots. Minimal version: a `web_app` button type with an external URL, plus a menu button (`setChatMenuButton`) on publish. Hosting Mini Apps ourselves is deferred (see below)                                                                                                                                                                                                                                                                                  | `features/telegram-webhook/lib/nodes`, `features/publish-bot`                                                        | S          | P2.8                                                                    |

## P3 — Scaling and advanced capabilities

| #    | Problem                                                                                            | Why it matters                                                                                       | Affected code                                                       | Complexity | Depends on                                                   |
| ---- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| P3.1 | Long node chains execute synchronously within a single webhook request, with no queue              | Long conversations could approach serverless/platform request timeouts                               | `features/telegram-webhook/lib/engine.ts`                           | L          | P2.2; only pursue if real usage data shows this is a problem |
| P3.2 | No team/role model — a bot has exactly one owning `userId`                                         | Needed only if the product targets teams sharing bot ownership, not solo users                       | `prisma/schema.prisma`, ownership checks across the codebase        | L          | A `User` model decision                                      |
| P3.3 | No undo/redo, copy/paste, or keyboard shortcuts in the workflow editor                             | Editor UX polish; does not affect production readiness or backend architecture                       | `entities/workflow/model/store`, `widgets/workflow-canvas`          | L          | —                                                            |
| P3.4 | No public API for third-party integrations                                                         | Only relevant once there is external demand for programmatic access                                  | Built on top of P2.3                                                | L          | P2.3                                                         |
| P3.5 | Condition/Summary nodes subscribe to the entire React Flow node array instead of a narrow selector | Unnecessary re-renders on large graphs (hundreds of nodes)                                           | `entities/workflow/ui/nodes/condition-node.tsx`, `summary-node.tsx` | M          | —                                                            |
| P3.6 | Nodes cannot send media (`attachmentIds` exists in node types but is not used by the runtime)      | Photos and documents are a common bot need                                                           | Supabase Storage, `sendPhoto` / `sendDocument` handlers             | M          | P2.8                                                         |
| P3.7 | No HTTP request / outgoing webhook node                                                            | Needed for integrations (CRM, spreadsheets); requires SSRF protection, timeouts, and secret handling | New node + runtime handler                                          | L          | P2.8, P1.3                                                   |
| P3.8 | No delay / "typing…" (`sendChatAction`), jump, or set-variable nodes                               | Dialog polish and reuse of graph parts                                                               | `features/telegram-webhook/lib/nodes`                               | M          | P2.8                                                         |

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

P1.13 (loop guard) ────────► P2.11 (connection rules on canvas)
P1.15 (HTML escaping) ─────┬─► P2.9 (emulator shares formatting with runtime)
                            └─► P2.14 (text formatting and variables)
P1.22 (token uniqueness) ──► P2.12 (publish UX)
P0.7 (runtime tests) ──────► P2.8 (pure engine) ─┬─► P2.9 (emulator)
                                                  ├─► P2.14, P2.15, P2.16 (new node capabilities)
                                                  └─► P3.6, P3.7, P3.8
P1.14 + P1.18 + P2.9 + P2.10 ─► P2.13 (guest mode)
P1.7 (BotResponse FK) ─────► P1.21 (data deletion), P2.4 (responses view)
```

The single hard rule encoded above: **P2.2 (backend extraction) must not start before P0.5, P0.7, P1.1, and
P1.3 are done.** Everything else can be reordered based on product priority within its tier.

A second rule for the product track: **guest mode (P2.13) must not ship before server-side publish validation
(P1.14) and distributed rate limiting with quotas (P1.18)** — it opens the product to unauthenticated traffic.

---

## Q4 2026 plan (October – December)

Approved on 2026-10-09. About 13 weeks, split into three milestones. The order is deliberate: guest mode and
templates will bring new users, so the runtime must be safe and observable first; the emulator and templates come
before guest mode because without them a guest has nothing to try.

### M1 — Safe for public beta (weeks 1–3)

- Runtime safety: P1.13, P1.14, P1.15, P1.16, P1.17 + P1.12, P1.19, P1.20.
- Observability: P1.3 (Sentry + structured logger, starting with the webhook).
- Limits: P1.18 (Upstash Redis rate limiting + per-user quotas). This is the observed need that principle 4
  requires before adding Redis.
- Legal: P1.21.
- Cleanup: P1.7, P1.8; sync `README.md` with the current state (autosave, token encryption).

### M2 — Clear from the first minute (weeks 4–8)

- P2.8 — pure engine with transports (enabler for the rest of the quarter).
- P2.9 — Telegram emulator in the editor.
- P2.10 — templates and onboarding.
- P2.11 — connection rules, on-canvas validation, dark-theme fixes.
- P2.12 + P1.22 — publish UX and token uniqueness.
- P2.4 — minimal responses view with CSV export (pulled forward: without it the product shows no value to
  bot owners).
- P1.11 — E2E for save, publish, and the emulator.

### M3 — Wider and simpler (weeks 9–13)

- P2.13 — local-first guest mode.
- P2.14 — text formatting and variables.
- P2.15 — node batch 1.
- P2.16 — `web_app` and menu buttons.

### Not in this quarter

P2.1 (publish history — first candidate for Q1 2027), P2.2 (backend extraction), P2.7, P1.9, P3.6–P3.8,
hosted Mini Apps, P3.3 (undo/redo).

---

## Roadmap by domain

### Frontend

- Fix `isDirty` semantics (P1.5); add autosave.
- Remove dead `workflow-actions` feature (P1.8).
- Narrow Zustand/React Flow subscriptions on Condition/Summary nodes (P3.5).
- `error.tsx` / `global-error.tsx` (P0.9).
- Editor UX polish — undo/redo, copy/paste, shortcuts (P3.3) — intentionally last.
- Telegram emulator (P2.9), templates and onboarding (P2.10), connection rules and on-canvas validation (P2.11),
  guest mode (P2.13), text formatting and variable picker (P2.14).

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
- Loop guard (P1.13), HTML escaping (P1.15), graceful failure with a fallback message (P1.16), tolerant `choice`
  handling (P1.17), `deleteWebhook` on bot deletion (P1.19).
- Per-chat concurrency and `429` retries (P2.7).
- Pure engine with transports (P2.8), then new node capabilities (P2.15, P2.16, P3.6–P3.8).
- Extraction into a dedicated service (P2.2), only after the above are done.

### Security

- Close all ownership/authorization gaps (P0.1–P0.4) — the single highest-priority item in this roadmap.
- Webhook security (P0.5).
- Rate limiting (P1.2), security headers (P1.10), real session validation in middleware (P1.4).
- Token encryption (P1.6 → P2.5).
- Server-side publish validation (P1.14), distributed rate limiting and quotas (P1.18), configured `APP_URL`
  for webhooks (P1.20), token uniqueness (P1.22).
- Privacy Policy, ToS, and end-user data deletion (P1.21).

### Testing

- Runtime engine/controller/handler tests (P0.7).
- E2E coverage for save/publish/webhook flows (P1.11), plus the emulator once P2.9 exists.
- `tsc --noEmit` as an explicit CI step alongside the existing lint/test/build/e2e pipeline.

### Deployment / DevOps

- Fix the CI install-step defect (P0.8).
- Add a Dockerfile / deployment manifest (P1.9).
- Add health checks and per-service monitoring once a second service exists (P2.6).

### Analytics

- Do not build any UI before P1.7 (FK integrity) is in place.
- Start with a simple per-bot list of collected responses; only build aggregation/dashboards (P2.4 extended)
  once the simple view is validated with real usage. The simple view with CSV export is scheduled for Q4 2026 M2.

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
- **Hosting Mini Apps built in the constructor** (catalogs, forms, booking pages) — effectively a second
  product (a page builder). It needs `initData` signature validation and a separate CSP, because the current
  `frame-ancestors 'none'` blocks Telegram Web, which loads Mini Apps in an iframe. Revisit after guest mode and
  the responses view, if users ask for it; the minimal `web_app` button is P2.16.
- **Supabase anonymous sign-in for guest mode** — rejected in favour of local-first drafts (P2.13), because it
  writes guest data to the database before distributed rate limiting exists.
