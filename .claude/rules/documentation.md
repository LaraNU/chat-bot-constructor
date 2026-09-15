---
paths:
  - "docs/**"
  - "README.md"
---

# Documentation

Keep documentation consistent with the actual implementation.

When a significant architectural decision or system contract changes,
check whether the following files are affected: `README.md`,
`docs/architecture.md`, `docs/frontend.md`, `docs/backend.md`,
`docs/cursor-context.md`.

## Responsibilities

- **README.md** — project overview, setup instructions, development
  instructions, high-level project information.
- **docs/architecture.md** — system architecture, major architectural
  decisions, module boundaries, data flow, architectural constraints.
- **docs/frontend.md** — frontend architecture, frontend-specific
  conventions, state management architecture, UI architecture.
- **docs/backend.md** — backend architecture, API architecture,
  persistence, runtime architecture, infrastructure decisions.
- **docs/cursor-context.md** — concise context for AI-assisted
  development: project purpose, tech stack, current architecture,
  important domain boundaries, current development priorities, future
  architectural direction. Don't duplicate detailed engineering rules from
  `.claude/rules/` inside this file.

When documentation is outdated because of an architectural change,
explicitly mention which documentation should be updated.
