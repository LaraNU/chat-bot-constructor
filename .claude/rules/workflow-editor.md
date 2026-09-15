---
paths:
  - "src/entities/workflow/**"
  - "src/features/workflow-actions/**"
  - "src/widgets/workflow-canvas/**"
  - "src/widgets/properties-panel/**"
  - "src/widgets/nodes-palette/**"
  - "src/widgets/editor-header/**"
  - "src/views/workflow-editor/**"
---

# Workflow Editor

The workflow editor is a core product domain, distributed across:

- `src/entities/workflow` — workflow domain, state, selectors, mutations,
  validation, persistence, workflow types
- `src/features/workflow-actions` — user interactions and feature-level
  workflow operations
- `src/widgets/workflow-canvas` — workflow canvas composition
- `src/widgets/properties-panel` — node property editing UI
- `src/widgets/nodes-palette` — node creation UI
- `src/widgets/editor-header` — editor-level UI
- `src/views/workflow-editor` — page-level editor composition

## Store architecture

The workflow editor uses isolated Zustand Vanilla Stores. Each editor
instance owns its own store, created with `createStore()` and provided
through React Context. There must be no global singleton workflow store.

Store factory: `src/entities/workflow/model/store/workflow-store.ts`

## State ownership

- `entities/workflow` owns workflow state and domain-level graph mutations
- `features/workflow-actions` owns user interactions and feature-level
  workflows
- widgets compose UI and connect user interactions to the appropriate
  actions
- presentation components should not contain workflow domain logic

Don't move domain logic into UI components for convenience. Don't
duplicate workflow mutations across widgets or features.

## Existing workflow APIs

Before adding a new workflow operation:

1. Search `src/entities/workflow` for an existing mutation or domain
   operation.
2. Search `src/features/workflow-actions` for an existing feature-level
   action.
3. Extend the existing implementation when the responsibility matches.
4. Avoid creating parallel implementations of the same workflow operation.

## Performance

Store update granularity and rendering performance for workflows with
hundreds of nodes are covered in `react-flow.md` (Performance, Large
Graphs). Apply that guidance whenever mutating node/edge state here.

## Editor and runtime separation

The editor and the Telegram runtime are separate systems — see
`telegram-runtime.md` for the full boundary (what belongs to the editor vs.
the runtime, and what the runtime must never depend on).

## Workflow changes

When changing workflow data structures, consider all affected parts of the
system: editor state, persistence, published workflow snapshots, workflow
validation, Telegram runtime execution. Don't change the workflow contract
in one layer without checking its consumers.
