# Cursor Context

## Project Overview

This project is evolving from an MVP into a production-grade SaaS product: a visual Telegram chatbot constructor.

Strategic direction: internal/first-party usage first (single team, controlled bot set), then a public multi-tenant SaaS
where external users self-register, create, and publish their own Telegram bots.

Users build chatbot conversation flows using a visual workflow editor powered by XYFlow / React Flow.

This is a production application used by real users and a team. The frontend is implemented first; the next strategic phase is building
a dedicated backend service (Node.js — NestJS or an equivalent framework, decision pending), with production
deployment, database architecture, authentication/authorization, bot execution infrastructure, monitoring,
logging, testing, and CI/CD treated as first-class deliverables, not afterthoughts.

---

## Technology Stack

Current (implemented):

* Next.js App Router
* React
* TypeScript (strict)
* Tailwind CSS
* Radix UI
* CVA
* Zustand Vanilla Store
* React Context
* XYFlow / React Flow v12
* React Hook Form
* Zod
* Next.js Route Handlers (webhook only) + Server Actions (all other mutations)
* PostgreSQL (hosted on Supabase)
* Prisma ORM
* Supabase Auth
* next-intl
* Vitest
* React Testing Library
* Playwright

Planned (not yet implemented — see Target Production Architecture):

* Standalone Node.js backend service (NestJS or equivalent — final choice pending evaluation)
* Structured logging (e.g. pino)
* Error/monitoring tooling (e.g. Sentry)
* Containerization (Docker) and an explicit deployment manifest

---

## Project Architecture

The project follows Feature-Sliced Design (FSD).

Main layers:

```text
shared
    ↓
entities
    ↓
features
    ↓
widgets
    ↓
views
    ↓
app
```

The project also contains infrastructure outside the FSD layers:

* `prisma/` — database schema and migrations
* `tests/` — Playwright end-to-end tests

### Main Layer Responsibilities

* `shared` — reusable UI, utilities, infrastructure, API clients, authentication, database access, and common types
* `entities` — domain entities and domain logic such as bots and workflows
* `features` — user interactions and feature-specific business logic such as workflow actions and Telegram webhook execution
* `widgets` — composed UI blocks such as the workflow canvas, property panel, node palette, headers, and bot list
* `views` — page-level composition
* `app` — Next.js routing, layouts, providers, and HTTP route handlers

### Domain logic is already framework-agnostic

`entities/*/server/service.ts` and `repository.ts` contain pure business logic with no dependency on
`NextRequest`/`NextResponse` or Server Action wrappers. This is the layer the future backend service will reuse
directly — it is the reason a backend extraction is feasible without a full rewrite. Do not introduce
Next.js-specific APIs (`headers()`, `revalidatePath`, cookies) into this layer.

---

## Workflow Editor

The workflow editor is a central part of the application.

The main workflow domain is located in:

`src/entities/workflow`

The workflow entity contains:

* workflow state
* isolated Zustand Vanilla Store (one store instance per editor, provided via React Context — never a global singleton)
* React Context provider
* selectors and mutations
* workflow validation (3-phase: graph structure, node connections, node data)
* workflow persistence actions
* node configuration and domain types

Store Factory:

`src/entities/workflow/model/store/workflow-store.ts`

Workflow-related user interactions are implemented in:

`src/features/workflow-actions` — **legacy/unused**, not referenced anywhere in `src`; candidate for removal,
do not extend it.

The editor UI is composed in widgets such as:

* `src/widgets/workflow-canvas`
* `src/widgets/properties-panel`
* `src/widgets/nodes-palette`
* `src/widgets/editor-header`

The page-level editor composition is located in:

`src/views/workflow-editor`

Supported node types: `start`, `message`, `question`, `choice`, `condition`, `summary`, `end`.

---

## Workflow Data, Publishing, and Bot Lifecycle

The workflow editor produces a serializable workflow representation containing nodes and edges.

The workflow has two important states:

* the editable draft stored in `Flow`
* the published snapshot stored in `FlowSnapshot`

The draft may change during editing without changing the workflow currently executed by a published bot.

Publishing creates or updates the published workflow snapshot.

The Telegram runtime executes the published workflow rather than the editor's current unsaved state.

Bot status is a derived value (`draft` / `published` / `published_with_changes`), computed by comparing
`Flow.updatedAt` to `FlowSnapshot.createdAt` (`entities/bot/model/types.ts`).

**Current limitation:** `FlowSnapshot` is a single upsert row per `Flow` (enforced by a unique constraint).
There is no publish history and no rollback to a previous published version. Treat any "versioning" claim about
this system as aspirational, not implemented, until a snapshot history model is added.

---

## Telegram Runtime

Telegram bot execution is implemented in:

`src/features/telegram-webhook`

The feature contains:

* webhook controller
* runtime execution engine
* session handling
* node handlers
* node handler registry
* runtime types and guards

The main runtime components include:

* `engine.ts`
* `session.ts`
* `lib/nodes/registry.ts`
* node-specific handlers

The Next.js HTTP entry point for Telegram webhooks is:

`src/app/api/webhook/route.ts`

The runtime is independent from the workflow editor UI: it has no dependency on React, React Flow, or
editor-specific state. This independence is intentional and is what makes future extraction into a standalone
backend service low-risk.

Session/conversation state (`UserSession`) is persisted in PostgreSQL, not in memory — this is required for
correctness on serverless/multi-instance deployments and must be preserved in any future refactor.

### Known runtime limitations (do not treat as resolved)

* No `X-Telegram-Bot-Api-Secret-Token` validation; the bot is resolved via `botId`/`token` query parameters,
  and the token is not cross-checked against `Bot.token` in the database.
* The bot token is embedded in the webhook URL (`setWebhook` call), not just stored server-side.
* No idempotency handling for duplicate Telegram updates (`update_id` is not tracked).
* Handler/engine errors are caught at the webhook boundary and reported to Telegram as success, which prevents
  retries but also means runtime failures are currently silent (only `console.error`, no structured logging or
  alerting).

These are real production gaps, not stylistic preferences — treat them as prerequisites for any multi-tenant
public launch, not as later polish.

---

## Authentication, Authorization, and Data Isolation

Authentication is handled by Supabase Auth (`@supabase/ssr`), used purely for identity/session — it is not used
for authorization decisions.

Authorization (resource ownership) is implemented ad hoc in application code, and is **inconsistent**:

* Bot creation and bot listing correctly scope queries by `userId`.
* Bot publishing checks ownership at the database-write step (`where: { id, userId }`).
* Bot deletion and workflow save/read currently do **not** verify that the authenticated user owns the target
  `botId` before acting on it.

`src/middleware.ts` currently gates protected routes by checking for the presence of a cookie whose name
includes `auth-token`, not by validating the JWT itself.

**Do not assume ownership is enforced anywhere it isn't explicitly checked in the reviewed code.** Before adding
a new bot/workflow mutation that accepts an id from the client, verify (in code, not by assumption) whether an
ownership check already exists on that path.

---

## Database Layer

Database: PostgreSQL (hosted on Supabase), accessed exclusively through Prisma — no Row Level Security is in
use, and no raw SQL is used in application code.

Prisma schema and migrations are located in:

`prisma/`

Models: `Bot`, `Flow` (draft, 1:1 with `Bot`), `FlowSnapshot` (published, 1:1 with `Flow`), `UserSession`
(Telegram conversation state, unique on `botId + telegramChatId`), `BotResponse` (collected answers, currently
**without** a foreign key relation to `Bot`).

There is no `User` model in Prisma; `Bot.userId` is an unconstrained string that must match a Supabase Auth user
id by convention, not by foreign key.

Known schema gaps (tracked, not yet fixed): missing index on `Bot.userId`; missing foreign key from
`BotResponse` to `Bot`; `Bot.token` stored as plaintext.

---

## Current Backend Architecture (as implemented today)

The current backend is Next.js Server Actions (for bot/workflow CRUD and publishing) plus a single Route Handler
(for the Telegram webhook). There is no standalone REST API and no separate backend process.

This is not the target architecture — it is the current implementation, kept intentionally simple while the
core product (editor, runtime, data model) stabilizes.

---

## Target Production Architecture

```text
Next.js (frontend + thin BFF via Server Actions)
    ↓ REST (future)
Standalone Node.js backend service (NestJS or equivalent — TBD)
    ↓
Prisma
    ↓
PostgreSQL
```

The backend service will own:

* the Telegram webhook and execution engine (first candidate for extraction — already framework-agnostic)
* bot/workflow CRUD, exposed as a documented REST API
* authorization/ownership enforcement as a first-class concern, not an afterthought
* structured logging, error monitoring, and health checks

This target is directional. Do not begin implementing the extraction before the current-implementation gaps
listed above (authorization, webhook security, testing) are resolved — migrating a monolith with unresolved
security gaps produces a distributed system with the same gaps, at higher operational cost.

---

## Internationalization

The application uses `next-intl`.

Supported locales:

* English
* Russian

Translation files:

* `src/shared/langs/en.json`
* `src/shared/langs/ru.json`

---

## Testing

The project uses:

* Vitest for unit and integration tests
* React Testing Library for React component tests
* Playwright for end-to-end tests

Unit and component tests are colocated with the relevant source modules.

End-to-end tests are located in:

`tests/`

**Current test coverage gaps** (explicitly tracked, not assumed to be fine): the Telegram runtime engine,
webhook controller, node handlers, Prisma repositories, and Server Actions currently have no automated tests.
E2E coverage exists only for authentication and bot creation — publish, save, and webhook flows are untested
end-to-end.

---

## CI/CD, Logging, and Observability

CI (`.github/workflows/ci.yml`) runs lint, Vitest, build, and Playwright on push/PR to `main`.

**Known CI defect:** the "Install dependencies" step is a malformed multi-line YAML scalar that runs
`npm install npm ci` as a single command instead of running `npm install` and `npm ci` separately — this should
be fixed before relying on this pipeline as a quality gate.

Logging is currently unstructured (`console.error` only, no `console.log` usage). There is no structured
logger, no request/correlation id, no error monitoring service, and no metrics/tracing.

There is no Dockerfile, docker-compose file, or deployment manifest in the repository. Deployment is currently
not reproducible from the repository alone.

---

## Temporary / Provisional Decisions

The following are explicitly temporary and should not be treated as permanent architectural choices when making
unrelated changes:

* Bot token stored in plaintext and passed via the webhook URL query string — a security placeholder, not a
  design decision to preserve.
* `FlowSnapshot` as a single upsert row (no publish history) — a simplification, not the intended long-term
  publishing model.
* Server Actions as the entire "API" surface — acceptable for the current single-process monolith, not the
  target for a multi-tenant public product.
* **Email confirmation disabled in Supabase Auth** — temporarily disabled (Authentication → Providers → Email →
  "Confirm email" = off) because the built-in Supabase SMTP has a 2 emails/hour project-wide limit, which makes
  it unusable for any real signup flow. The application does not request `emailRedirectTo` and does not render a
  "check your inbox" screen. This will be reverted and a custom SMTP domain configured in the `transactional-email`
  change. Do not build features that assume email-confirmed accounts.
* `src/middleware.ts` cookie-presence check — **replaced** (as of `fix-auth-flow`) with a proper `getUser()`
  call that validates the session against Supabase Auth and silently refreshes the access token. The middleware
  is now a correct session gate, not just a cookie-presence check.
* `src/features/workflow-actions` — dead code kept temporarily; do not extend it, and do not assume it is wired
  into the editor.

## Decisions That Require Reviewing Existing Code First

Do not make the following assumptions without re-reading the current implementation — they are easy to get
wrong and have direct security or correctness impact:

* Whether a given bot/workflow mutation already enforces ownership — verify in the specific repository/service/
  action file, do not assume parity across similar-looking operations (ownership enforcement is currently
  inconsistent across `create`, `delete`, `save`, `publish`).
* Whether the Telegram webhook route currently validates anything beyond presence of `botId`/`token` query
  params — it does not, as of this writing, but any future change here must be re-verified against
  `src/features/telegram-webhook/api/controller.ts` directly.
* Whether `FlowSnapshot` supports multiple versions — it currently does not (unique constraint on `flowId`).
* Whether Zustand selectors in `entities/workflow/ui/nodes` subscribe narrowly or to the entire React Flow
  store — some custom nodes (e.g. condition/summary) currently subscribe to the full node array; check before
  assuming granular subscriptions are in place everywhere.

---

## Current Development Priorities (near-term)

1. Close authorization/ownership gaps on bot delete, workflow save, and editor page access.
2. Add Telegram webhook secret-token validation; stop passing the bot token via the webhook URL.
3. Fix the CI install-step defect; add a `tsc --noEmit` check.
4. Add tests for the Telegram runtime engine, webhook controller, and node handlers.
5. Add a missing index on `Bot.userId` and a foreign key from `BotResponse` to `Bot`.
6. Workflow autosave with debounce; fix `isDirty` to not trigger on selection/drag-only changes.

---

## Long-Term Roadmap

1. Extract the Telegram webhook and execution engine into a standalone Node.js backend service, reusing the
   existing framework-agnostic `service.ts`/`repository.ts` layer as-is.
2. Introduce a documented REST API for bot/workflow operations; migrate Server Actions to thin clients over it
   incrementally, one resource at a time.
3. Add structured logging, error monitoring, and health checks to the extracted backend.
4. Add a publish history / snapshot versioning model with rollback support.
5. Add containerization and an explicit deployment manifest so the system is deployable directly from the
   repository.
6. Multi-tenant hardening for public self-service usage: rate limiting, per-tenant resource limits, and a
   deliberate review of every ownership check before opening bot creation to external users.
7. Workflow editor UX improvements (undo/redo, copy/paste, keyboard shortcuts, automatic layout) — intentionally
   sequenced after the items above, since they do not affect production readiness or backend architecture.
