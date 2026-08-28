# BotFlow Platform

A visual, no-code constructor for Telegram chatbots. Users design conversation flows on a visual canvas and
publish them as live Telegram bots — no scripting required.

This is not a tutorial project. It is being built and evolved as a real product, following a deliberate
production trajectory: from an internal tool used by a single team, to a public product where external users
register, build, and publish their own bots.

> **Status:** active development. The product core (visual editor, workflow persistence, publishing, Telegram
> runtime) is functional end-to-end. Several production-hardening items (see [Production Readiness](#production-readiness-status))
> are tracked and in progress before a public launch.

---

## Table of Contents

- [BotFlow Platform](#botflow-platform)
  - [Table of Contents](#table-of-contents)
  - [Product Overview](#product-overview)
  - [Product Goals and Evolution](#product-goals-and-evolution)
  - [Key Features Currently Implemented](#key-features-currently-implemented)
  - [Architecture Overview](#architecture-overview)
  - [Frontend Architecture (FSD)](#frontend-architecture-fsd)
  - [Backend / Server Architecture Today](#backend--server-architecture-today)
  - [Data Model Overview](#data-model-overview)
  - [Authentication and Authorization](#authentication-and-authorization)
  - [Rate limiting](#rate-limiting)
  - [Telegram Integration](#telegram-integration)
  - [Workflow Engine](#workflow-engine)
  - [Validation and Publishing Flow](#validation-and-publishing-flow)
  - [Testing Strategy](#testing-strategy)
  - [CI/CD](#cicd)
  - [Local Development Setup](#local-development-setup)
  - [Environment Variables](#environment-variables)
  - [Project Structure](#project-structure)
  - [Production-Readiness Status](#production-readiness-status)
  - [Roadmap](#roadmap)
  - [Future Architecture Evolution](#future-architecture-evolution)

---

## Product Overview

Chat Bot Constructor lets a user:

1. Create a bot record and get a default conversation flow to start from.
2. Build a conversation graph visually — messages, questions, branching choices, conditions, a summary step,
   and an end step — using a React Flow-based canvas.
3. Save the draft flow, validate it, and publish it by registering a Telegram Bot API token.
4. Have a live Telegram bot execute that published flow against real end users, tracking each user's position
   in the conversation and collecting their answers.

The editor and the Telegram runtime are architecturally separate systems connected by a single contract: a
published **workflow snapshot**. Editing a bot's draft never affects the bot currently running in Telegram until
it is explicitly re-published.

## Product Goals and Evolution

The project is designed to move through four stages. Each stage adds requirements without discarding the
previous architecture:

| Stage | Description | Status |
|---|---|---|
| **1. Internal tool** | A small team creates and manages a handful of Telegram bots for internal use. | Core functionality implemented |
| **2. Internal multi-user beta** | Multiple team members use the same deployment with separate accounts. | Requires closing remaining multi-tenant isolation gaps (see [Roadmap](#roadmap)) |
| **3. Public beta** | External users register and use the product with a shared, monitored deployment. | Not started — depends on stage 2 hardening, observability, and rate limiting |
| **4. Self-service SaaS** | Users register, manage their own bots independently, and view usage analytics for their bots. | Long-term direction; requires publish/version history, analytics UI, and further backend work |

A longer-term architectural direction — extracting the Telegram runtime into a dedicated Node.js backend service
— is described in [Future Architecture Evolution](#future-architecture-evolution). It is not implemented today.

## Key Features Currently Implemented

- Email/password authentication (sign up, sign in, session handling) via Supabase Auth.
- Bot management: create, list (paginated), and delete bots.
- A visual workflow editor (React Flow) supporting seven node types: `start`, `message`, `question`, `choice`,
  `condition`, `summary`, `end`.
- A per-editor-instance state store (Zustand) with node/edge mutations, selection, and dirty-state tracking.
- A property panel for editing node content per node type.
- Domain-level workflow validation (graph structure, node connections, node data) before publishing.
- Draft persistence (manual save) and a separate published snapshot, so editing never breaks a live bot.
- Publishing flow: registers a Telegram webhook for the bot and atomically stores the published snapshot.
- A working Telegram runtime: receives webhook updates, tracks per-chat conversation state in PostgreSQL,
  executes the published graph node by node, and sends messages/inline keyboards back to the user.
- Collection of end-of-conversation answers per chat (stored, not yet surfaced in any UI — see
  [Roadmap](#roadmap)).
- Internationalization (English/Russian) across all user-facing UI.
- Unit/integration tests (Vitest) for validation logic, domain services, and store behavior, plus end-to-end
  tests (Playwright) for authentication and bot-creation flows.

## Architecture Overview

The application is currently a **Next.js modular monolith**. There is no separate backend process.

```text
┌───────────────────────────────────────────────────────────┐
│                     Next.js (App Router)                   │
│                                                             │
│  Pages / RSC          Server Actions          Route Handler│
│  (dashboard, editor,  (bot & workflow CRUD,   (/api/webhook│
│   auth pages)          publishing)             — Telegram) │
│         │                     │                     │      │
│         └──────────┬──────────┘                     │      │
│                     ▼                                ▼     │
│         entities/*/server (service + repository)           │
│         — framework-agnostic domain logic                  │
└───────────────────────┬─────────────────────────────────────┘
                         ▼
                      Prisma
                         ▼
                  PostgreSQL (Supabase)

              Supabase Auth  ── identity/session only
              Telegram Bot API ── outbound HTTP calls
```

The domain logic in `entities/*/server` does not depend on `NextRequest`/`NextResponse` or any Server Action
API. This separation is deliberate and is what keeps a future backend extraction realistic (see
[Future Architecture Evolution](#future-architecture-evolution)) — it is not, today, a separate deployable
service.

## Frontend Architecture (FSD)

The project follows **Feature-Sliced Design**, with dependencies flowing strictly in one direction:

```text
shared → entities → features → widgets → views → app
```

| Layer | Responsibility | Examples |
|---|---|---|
| `shared` | Reusable UI kit, infrastructure, auth helpers, Prisma client, i18n | `shared/ui`, `shared/lib`, `shared/auth.ts` |
| `entities` | Domain models and domain logic | `entities/bot`, `entities/workflow` |
| `features` | User-facing interactions and use cases | `features/publish-bot`, `features/save-workflow`, `features/telegram-webhook` |
| `widgets` | Composed UI blocks | `widgets/workflow-canvas`, `widgets/properties-panel`, `widgets/bot-list` |
| `views` | Page-level composition | `views/dashboard`, `views/workflow-editor` |
| `app` | Next.js routing, layouts, providers, HTTP entry points | `app/[locale]`, `app/api/webhook` |

The workflow editor uses an **isolated Zustand vanilla store per editor instance**, created via `createStore()`
and provided through React Context (`entities/workflow/model/store`). There is no global singleton store — each
open editor owns its own state.

Key frontend technologies: React 19, TypeScript (strict mode), Tailwind CSS, Radix UI, CVA, React Hook Form,
Zod, `@xyflow/react` (React Flow v12), `next-intl`.

## Backend / Server Architecture Today

There is currently **no standalone backend service**. Server-side logic is implemented as:

- **Next.js Server Actions** (`'use server'`) for bot CRUD, workflow save, and publishing
  (`entities/bot/api/actions.ts`, `entities/workflow/api/actions.ts`, `features/publish-bot/api/actions.ts`).
- **A single Route Handler** at `app/api/webhook/route.ts` for the Telegram webhook, delegating to
  `features/telegram-webhook`.

Business logic itself lives in a transport-agnostic service/repository layer
(`entities/*/server/service.ts`, `entities/*/server/repository.ts`) built directly on Prisma. This layer has no
knowledge of Next.js request/response objects, which is what makes a future extraction into a dedicated backend
service an incremental migration rather than a rewrite.

## Data Model Overview

Managed by Prisma against PostgreSQL. Core models:

| Model | Purpose |
|---|---|
| `Bot` | A user-owned bot: name, description, Telegram token (once published) |
| `Flow` | The editable draft workflow (nodes/edges) for a bot — 1:1 with `Bot` |
| `FlowSnapshot` | The published workflow graph executed by the Telegram runtime — 1:1 with `Flow` |
| `UserSession` | Per-Telegram-chat conversation state (current node, temporary answers) — unique per `(botId, telegramChatId)` |
| `BotResponse` | Collected end-of-conversation answers per chat |

The separation between `Flow` (draft) and `FlowSnapshot` (published) is a core architectural invariant: the
Telegram runtime **only ever reads from `FlowSnapshot`**, never from the live draft. Editing a bot's flow has no
effect on the running bot until it is re-published.

Publishing is implemented as an atomic database transaction (bot token update + snapshot upsert), combined with
registering the webhook against the Telegram Bot API.

## Authentication and Authorization

**Authentication** is handled by Supabase Auth (`@supabase/ssr`) for sign-up, sign-in, and session/cookie
management. Sign-in and sign-up run **in the browser against `*.supabase.co`** (`signInWithPassword` /
`signUp`) — they are not proxied through a Next.js Server Action or Route Handler, so Next.js middleware
cannot rate-limit password attempts. Server-side code verifies the session via `supabase.auth.getUser()`.
After a successful sign-in or sign-up the user is navigated to the dashboard via `router.push('/')` +
`router.refresh()` — explicit navigation rather than relying on an indirect RSC refresh.

**Email confirmation is temporarily disabled.** The built-in Supabase SMTP has a 2 emails/hour project-wide
limit, which makes it unusable for real signup flows. Until a custom SMTP domain is configured (planned in the
`transactional-email` change), new accounts are activated immediately without requiring a confirmation email.
**Password reset is not yet implemented.**

Brute-force protection for auth is a **Supabase Auth** concern, not an application limiter. Review and tighten
the project limits under **Authentication → Rate Limits** in the [Supabase dashboard](https://supabase.com/dashboard/project/_/auth/rate-limits)
(see [Rate limits](https://supabase.com/docs/guides/auth/rate-limits)). Both sign-in and sign-up forms map the
Auth error code `too_many_requests` to a localised user-facing message.

**Authorization** (resource ownership) is enforced in application code path-by-path rather than through a
database-level policy layer (no Row Level Security is used; Prisma accesses PostgreSQL directly). Bot creation
and bot listing are correctly scoped to the authenticated user. Ownership enforcement is not yet uniform across
every bot/workflow mutation — closing these gaps consistently is an active, tracked item (see
[Production-Readiness Status](#production-readiness-status)) before any multi-user or public rollout.

## Rate limiting

Best-effort in-memory sliding-window limits (P1.2) protect publish, delete, and the Telegram webhook. Counters
live in the current process/isolate (`src/shared/lib/rate-limit`). On Vercel they are **not** a global cap —
a hard distributed limit needs Redis/Upstash later, once the Telegram runtime is extracted (P2.2). Limits are
**not** applied only in `src/middleware.ts`: that matcher excludes `api`, and auth/Server Actions would not be
covered there anyway.

| Surface | Where | Key | Over-limit behaviour |
|---|---|---|---|
| Login / signup | Supabase Auth (browser → `*.supabase.co`) | Supabase IP / project quotas | Auth `429` / `too_many_requests`; Next.js does not see the attempt |
| Publish / delete | Server Action after `getUser()` | Authenticated `userId` | `{ success: false, error: 'Too many requests' }` (same UI contract as other action errors) |
| Webhook, invalid or missing secret | `handleTelegramWebhook` | Client IP (`x-forwarded-for` first hop, else `x-real-ip`) | Existing `401`; does **not** consume the bot budget |
| Webhook, valid secret | `handleTelegramWebhook` | `botId` | `200 { success: true }` and drop — **not** `429`, so Telegram does not retry-storm an over-cap bot |

Optional env overrides (defaults apply when unset) are listed under [Environment Variables](#environment-variables).

## Telegram Integration

The Telegram runtime (`features/telegram-webhook`) is a self-contained execution engine with no dependency on
React, React Flow, or any editor-specific state:

- `api/controller.ts` — the webhook request handler: resolves the target bot, loads its published snapshot, and
  drives execution.
- `lib/engine.ts` — a small dispatch loop over the graph, using a node registry to resolve the handler for each
  node type.
- `lib/session.ts` — conversation state persisted in PostgreSQL (`UserSession`), not in memory — required for
  correctness across serverless invocations and multiple instances.
- `lib/nodes/*` — one handler per node type (`message`, `question`, `choice`, `condition`, `summary`, `end`),
  registered through a registry that is type-checked against all supported node types.

Outbound calls to the Telegram Bot API (`sendMessage`, `setWebhook`) live in
`shared/api/telegram/client.ts` and `features/publish-bot/lib/telegram.ts`.

Webhook requests are authenticated with `X-Telegram-Bot-Api-Secret-Token` (HMAC-derived per `botId`; the bot
token is not in the webhook URL). Duplicate deliveries are ignored via tracked `update_id`. Over-limit
handling is described under [Rate limiting](#rate-limiting).

## Workflow Engine

The domain workflow model (`entities/workflow`) defines seven node types and their data shapes:

- `start` — entry point of a conversation.
- `message` — sends a static message.
- `question` — asks a free-text question and stores the answer.
- `choice` — presents inline-keyboard options and branches by the selected option.
- `condition` — branches based on a previous answer (`equals` / `contains`).
- `summary` — recaps previously collected answers, optionally with a custom template.
- `end` — terminates the conversation and persists collected answers as a `BotResponse`.

Both the editor (for authoring) and the runtime (for execution) consume the same node/edge data shape, keeping
the visual representation and the executed behavior in sync by construction.

## Validation and Publishing Flow

Validation happens in two complementary layers:

1. **Domain graph validation** (`entities/workflow/lib/validation`) — a three-phase pipeline checking graph
   structure (single reachable start, at least one end node), node connections (e.g. condition/choice edges),
   and per-node-type data completeness. This runs before publishing and is fully unit-tested.
2. **Schema validation** (Zod) on the persisted payload (`entities/workflow/model/validation.ts`) and on the
   publish request (Telegram token format) before any database write.

Publishing sequence: the client-side workflow is validated → the user supplies a Telegram bot token → the
server registers the Telegram webhook → on success, the current draft is atomically promoted to a new
`FlowSnapshot` inside a single database transaction.

## Testing Strategy

- **Vitest + React Testing Library** for unit and component tests, colocated with the source they test.
  Current coverage focuses on domain validation (all three validation phases), the bot/workflow service layer,
  Zustand store mutations, and several UI components.
- **Playwright** for end-to-end tests (`tests/`), currently covering authentication (sign-in/sign-up) and bot
  creation.

Known gap: the Telegram runtime (engine, webhook controller, node handlers) and the Prisma repositories/Server
Actions do not yet have automated test coverage. Closing this gap is a near-term priority given that this code
path directly affects real Telegram users once a bot is published.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request to `main`:

1. Install dependencies, generate the Prisma client.
2. Lint (ESLint) and run the Vitest suite.
3. Build the application.
4. Run the full Playwright end-to-end suite (Chromium, Firefox, WebKit) and upload the HTML report.

Husky enforces Conventional Commits and runs `lint-staged` (ESLint + Prettier) on every commit.

There is currently no automated deployment step in CI — deployments are performed outside the repository.

## Local Development Setup

**Prerequisites:** Node.js `v22.10.0` (see `.nvmrc`), a PostgreSQL database (the project targets Supabase, but
any PostgreSQL instance reachable via `DATABASE_URL`/`DIRECT_URL` works), and a Supabase project for
authentication.

```bash
# 1. Install dependencies (also runs `prisma generate` via postinstall)
npm install

# 2. Create a .env.local file with the variables listed below

# 3. Apply the database schema
npx prisma migrate deploy   # or: npx prisma migrate dev (to create new migrations locally)

# 4. Start the dev server
npm run dev
```

Other useful scripts:

```bash
npm run build          # production build
npm run start           # run a production build locally
npm run test            # Vitest unit/integration tests
npm run test:playwright # Playwright end-to-end tests
npm run lint             # ESLint
npm run lint:fix         # ESLint with autofix
npm run prettier         # Prettier formatting
```

To receive real Telegram updates locally, the webhook URL registered with Telegram must be publicly reachable
(e.g. via a tunneling tool); this is not automated by the project.

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string used by Prisma at runtime |
| `DIRECT_URL` | Direct PostgreSQL connection string used by Prisma for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase publishable (anon) key |
| `NEXT_PUBLIC_APP_URL` | Public base URL used to construct the Telegram webhook URL when publishing a bot; falls back to `VERCEL_URL` if unset |
| `TELEGRAM_WEBHOOK_SECRET_KEY` | Server-only key used to deterministically derive each bot's Telegram webhook secret (`HMAC-SHA256(botId)`); registered with Telegram as `secret_token` and verified on every incoming update via the `X-Telegram-Bot-Api-Secret-Token` header |
| `RATE_LIMIT_MUTATION_MAX` / `RATE_LIMIT_MUTATION_WINDOW_SEC` | In-memory cap for publish+delete per authenticated user (default `10` / `60s`). Does **not** apply to login/signup |
| `RATE_LIMIT_WEBHOOK_IP_MAX` / `RATE_LIMIT_WEBHOOK_IP_WINDOW_SEC` | In-memory cap for webhook requests with an invalid or missing secret, keyed by client IP (default `60` / `60s`) |
| `RATE_LIMIT_WEBHOOK_BOT_MAX` / `RATE_LIMIT_WEBHOOK_BOT_WINDOW_SEC` | In-memory cap for webhook requests with a valid secret, keyed by `botId` (default `120` / `60s`) |
| `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | Credentials used by the Playwright authentication setup |

Copy [`.env.example`](.env.example) to `.env.local` (or `.env.test` for running tests) and fill in real values.

## Project Structure

```text
prisma/            Prisma schema and migrations
src/
  app/              Next.js App Router: pages, layouts, providers, the webhook route handler
  entities/         Domain entities: bot, workflow (model, server, ui, api)
  features/         User interactions: create/delete/publish/save bot & workflow, telegram-webhook, auth forms
  widgets/          Composed UI: workflow-canvas, properties-panel, nodes-palette, bot-list, headers
  views/            Page-level composition: dashboard, workflow-editor, auth pages
  shared/           UI kit, Supabase clients, Prisma client, API error handling, i18n
  i18n/             next-intl configuration and routing
tests/              Playwright end-to-end tests
.github/workflows/  CI pipeline
```

See `project-structure.txt` in the repository root for the full, generated file tree.

## Production-Readiness Status

The core product loop — build a workflow, publish it, run it against real Telegram users — works end to end.
The table below is an honest snapshot of what still separates the current state from each stage in the
[product evolution](#product-goals-and-evolution).

| Area | Status |
|---|---|
| Core editor, publishing, and Telegram runtime | Implemented and functional |
| Domain validation and unit test coverage (validation, services, store) | Implemented |
| Authentication | Implemented (Supabase Auth) |
| Authorization / multi-tenant isolation | Partially implemented — not yet uniform across all mutations |
| Telegram webhook transport security | Not yet implemented |
| Telegram delivery idempotency | Not yet implemented |
| Structured logging / error monitoring | Not yet implemented |
| Automated tests for the Telegram runtime | Not yet implemented |
| Rate limiting | Implemented for publish/delete (`userId`) and the webhook (IP vs `botId`); login/signup are limited by Supabase Auth, not Next.js. In-memory / per-isolate — not a global cap on Vercel |
| Deployment automation (containerization / deploy manifest) | Not yet implemented |
| Bot usage analytics UI | Not yet implemented (underlying data is already collected) |
| Publish history / rollback | Not yet implemented (publishing currently keeps only the latest snapshot) |

## Roadmap

The roadmap is organized by engineering phase rather than by individual task, in the order they are intended to
be addressed:

1. **Production hardening** — close remaining gaps in authorization consistency and database-level integrity
   (constraints/indexes) so the application behaves correctly under multiple concurrent users.
2. **Security and multi-tenant isolation** — make resource-ownership enforcement uniform across every bot and
   workflow operation, as a prerequisite for any multi-user or public usage.
3. **Telegram runtime reliability** — webhook transport verification, delivery idempotency, and visible error
   handling for the execution engine, backed by automated tests.
4. **Observability** — structured logging, error monitoring, and health checks, so operational issues are
   detected before users report them.
5. **Public beta readiness** — rate limiting, deployment automation, workflow autosave, and general production
   UX polish (error boundaries, resilient loading/empty states).
6. **Analytics** — surface the bot response data already being collected, starting with a simple per-bot view
   and evolving toward aggregated usage insights.
7. **Backend extraction into a dedicated Node.js service** — move the Telegram runtime into its own deployable
   service once it is secure, tested, and observable (see [Future Architecture Evolution](#future-architecture-evolution)).
8. **Self-service SaaS evolution** — publish history with rollback, a documented API surface, and the workflow
   editor UX improvements (undo/redo, keyboard shortcuts) needed for a self-service audience.

## Future Architecture Evolution

The long-term direction is to extract the Telegram runtime — and eventually other backend responsibilities —
into a dedicated Node.js service, while keeping Next.js as the frontend and thin BFF layer:

```text
Next.js (frontend + Server Actions)
        │  REST (planned)
        ▼
Dedicated Node.js backend service (framework choice not yet finalized)
        │
        ▼
     Prisma
        │
        ▼
   PostgreSQL
```

This is a directional target, not an implemented architecture. It is realistic without a full rewrite because
the current domain logic (`entities/*/server`) is already framework-agnostic and does not depend on Next.js
request/response primitives — the extraction work is expected to focus on the transport layer, authentication
handoff, and operational concerns (deployment, logging, monitoring) rather than on rewriting business logic.

The extraction is intentionally sequenced **after** the security, reliability, and observability work in the
[Roadmap](#roadmap): moving an unhardened runtime into a separate service would relocate its current gaps
rather than close them.
