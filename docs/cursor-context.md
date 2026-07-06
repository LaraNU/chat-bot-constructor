# Cursor Context

## Project Overview

This project is a production-style MVP of a visual chatbot constructor.

Users build chatbot conversation flows using a visual editor powered by React Flow.

The application is intended to evolve into a commercial SaaS platform.

The goal is not to build a demo, but to build a scalable architecture suitable for future growth.

---

# Core Features

Current functionality includes:

- visual workflow editor
- drag-and-drop node creation
- node property editing
- custom React Flow nodes
- custom edges
- workflow persistence
- workflow publishing
- Telegram bot execution
- authentication
- user-owned bots
- workflow validation

---

# Technology Stack

Frontend:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Radix UI
- CVA

State:

- Zustand Vanilla Store
- React Context

Canvas:

- React Flow (XYFlow)

Validation:

- Zod
- React Hook Form

Backend:

- Next.js Route Handlers

Database:

- PostgreSQL
- Prisma ORM

Authentication:

- Supabase Auth

Internationalization:

- next-intl

Testing:

- Vitest
- React Testing Library
- Playwright

---

# Internationalization (next-intl)

- NEVER hardcode user-facing strings in UI components, labels, or property panels.
- Always use `useTranslations()` from `next-intl` or ` getTranslations` from `next-intl/server` for server components;.
- Translation keys live in `@shared/langs/en.json` and `@shared/langs/ru.json`. Suggest adding keys there if missing.

---

# Architecture

The project follows Feature-Sliced Design.

Current layers:

shared

entities

features

widgets

app

Business logic should stay inside the layer that owns it.

Widgets compose features.

Features compose entities.

Entities own the domain.

Shared contains reusable infrastructure.

---

# Workflow Editor

Each editor instance owns its own Zustand store.

Stores are created using:

createStore()

and injected via React Context.

There are no global workflow stores.

The editor supports:

- node selection
- property panel editing
- drag & drop
- connection validation
- custom node rendering

The goal is to support large workflows without unnecessary rerenders.

- Store Factory Location: `@entities/workflow/model/store/workflow-store.ts`


---

# Workflow Runtime

The editor produces a serializable workflow.

Published workflows are executed by the Telegram runtime.

The runtime consists of:

- engine
- node registry
- node handlers

The runtime is intentionally independent from the editor UI.

Eventually it should become its own backend module.

---

# Current Development Priorities

Near-term priorities:

- complete Property Panel for every node type
- graph validation before publishing
- workflow autosave
- workflow versioning
- documentation

---

# Future Roadmap

Planned improvements include:

## Editor

- undo / redo
- copy / paste nodes
- keyboard shortcuts
- node grouping
- automatic layout

## Backend

Current backend is implemented with Next.js Route Handlers.

Future architecture:

Frontend

↓

REST API

↓

Fastify

↓

Prisma

↓

PostgreSQL

The backend will eventually become an independent service.

---

# Engineering Principles

Prefer:

- production-ready architecture
- reusable abstractions
- explicit naming
- scalability
- type safety

Avoid:

- duplicate components
- duplicated business logic
- architecture violations
- premature optimization

---

# Code Generation

When generating code:

- reuse existing abstractions
- search the project before creating new ones
- respect Feature-Sliced Design
- keep components cohesive
- keep business logic outside presentation components

Whenever possible, evolve the current architecture instead of replacing it.

---

# Communication Style

When recommending changes:

1. Explain the problem.
2. Explain trade-offs.
3. Recommend the production approach.
4. Explain why it fits this project specifically.

Do not assume this is a tutorial project.

Treat it as a real commercial product under active development.