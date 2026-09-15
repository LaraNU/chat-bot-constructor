---
paths:
  - "src/features/telegram-webhook/**"
  - "src/app/api/webhook/**"
  - "src/entities/bot/**"
  - "src/entities/workflow/**/*.tsx"
  - "src/entities/workflow/**/*.ts"
---

# Telegram Runtime

The Telegram runtime executes published chatbot workflows in response to
Telegram updates. Implemented primarily in `src/features/telegram-webhook`.
HTTP webhook entry point: `src/app/api/webhook/route.ts`.

## Runtime architecture

Includes: webhook controller, execution engine, session handling, node
handlers, node handler registry, runtime types and guards.

Main components: `engine.ts`, `session.ts`, `lib/nodes/registry.ts`,
node-specific handlers.

## Editor and runtime separation

The workflow editor and Telegram runtime are separate systems.

The **editor** is responsible for: editing workflows, managing draft state,
rendering the visual graph, validating workflows, publishing workflows.

The **runtime** is responsible for: receiving Telegram updates, loading the
published workflow, managing execution state, executing workflow nodes,
interacting with Telegram.

Don't couple runtime execution logic to: React components, React Flow
components, React Flow instance state, editor-only Zustand state,
browser-specific UI concerns.

## Published workflow

The editor produces a serializable workflow representation. The editable
workflow is stored as a draft. Published workflows are represented by a
published workflow snapshot. The Telegram runtime executes the published
snapshot rather than the editor's current unsaved state.

When changing workflow data structures, check compatibility between:
editable workflow data, persisted workflow data, published workflow
snapshots, runtime execution. Don't assume that changing the editor
representation automatically updates the runtime contract.

## Execution engine

Keep the engine independent from React, React Flow, UI components, and
editor-specific state. Don't put Telegram execution logic into React Flow
node components.

## Node handlers

Node execution behavior belongs to dedicated runtime handlers. The runtime
uses a node registry to resolve the appropriate handler for a workflow
node.

When adding a new executable node:

1. Check the existing node handler structure.
2. Reuse existing runtime types and utilities.
3. Implement the handler in the appropriate runtime module.
4. Register the handler in the node registry.
5. Add or update tests for the runtime behavior.

Don't duplicate execution logic between node handlers.

## Session state

Telegram conversation/session state must remain separate from editor
workflow state. Don't store runtime execution state in the workflow
editor's Zustand store. Don't make runtime execution depend on the current
browser session or editor instance.

## Webhook entry point

Keep the route handler focused on: receiving the webhook request,
validating/parsing the request, resolving the appropriate bot/runtime
context, invoking the runtime. Don't put the full workflow execution engine
inside the Next.js route handler.

## Runtime changes

When modifying runtime behavior, consider: published workflow
compatibility, node handler registry, session state, execution flow, error
handling, Telegram API interactions, persistence requirements. Prefer
changes that preserve the separation between the webhook transport layer
and the runtime execution engine.
