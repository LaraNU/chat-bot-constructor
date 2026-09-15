---
paths:
  - "src/**"
---

# Feature-Sliced Design Architecture

The project strictly follows Feature-Sliced Design (FSD).

## Layer dependency direction

`shared` → `entities` → `features` → `widgets` → `app`

A lower layer must never import from a higher layer. Never introduce layer
violations, circular dependencies, hidden cross-layer dependencies, or
dependency rule bypasses.

## Layer responsibilities

- **shared** — reusable technical infrastructure, generic UI, utilities,
  configuration, common functionality.
- **entities** — domain entities, domain models, domain-specific logic.
- **features** — user interactions and business use cases.
- **widgets** — composes entities and features into larger UI blocks.
- **app** — application-level composition, providers, routing, global
  configuration, application setup.

## Business logic

Business logic must stay in the layer/slice that owns the corresponding
responsibility. Don't move business logic into presentation components
merely for convenience.

## Public API

Use the Public API (`index.ts`) for cross-slice imports. Prefer
`@/entities/workflow` over `@/entities/workflow/model/...`. Don't import
internal implementation files from another slice.

If a required export is missing:

1. Check whether it should be exposed through the slice Public API.
2. Add the export when appropriate.
3. Don't bypass the Public API by importing internal files.

## Existing architecture

Before creating a new module:

1. Identify the correct FSD layer.
2. Identify the correct slice.
3. Search for existing functionality.
4. Extend an existing abstraction when responsibilities match.

Don't introduce a new abstraction solely to avoid modifying an existing one.

## Architecture reviews

When reviewing or modifying code, check both implementation correctness and
architectural correctness. A solution that works but violates FSD is not
considered production-ready.
