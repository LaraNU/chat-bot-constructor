---
paths:
  - "src/widgets/workflow-canvas/**"
  - "src/entities/workflow/**/*.tsx"
  - "src/entities/workflow/**/*.ts"
  - "src/features/workflow-actions/**/*.tsx"
  - "src/features/workflow-actions/**/*.ts"
---

# XYFlow / React Flow Rules

The project uses modern XYFlow / React Flow v12 APIs.

## API

Prefer modern APIs such as `useReactFlow`, `useNodesData`, `useEdges`, and
other current v12 APIs. Never introduce outdated React Flow v11 APIs,
structures, or types.

## Custom nodes

Custom node components should primarily be responsible for rendering node
UI. Keep node presentation separate from workflow graph manipulation.
Don't put complex workflow mutations directly inside presentational node
components.

When a node interaction changes workflow state: identify the appropriate
workflow action or mutation → reuse the existing workflow API when
possible → keep the node component focused on presentation and
interaction.

## Custom edges

Custom edge components should primarily handle edge rendering, edge-specific
UI, edge interaction. Don't introduce dependencies from the `entities`
layer into the `features` layer — in particular, don't make an entity-level
React Flow component import feature-level actions.

If an edge requires feature-level behavior: pass the required handler
through an appropriate higher-level component, or use an architecture that
preserves FSD dependency direction. Don't bypass FSD boundaries to access
feature actions.

## Graph mutations

Graph mutations belong to the workflow state/domain layer or the
appropriate workflow feature action. Don't duplicate graph mutation logic
between React Flow callbacks, custom nodes, custom edges, widgets, feature
actions, or the workflow store. Prefer centralized, predictable mutation
APIs.

## React Flow and workflow store

React Flow is responsible for visualizing and interacting with the graph.
The workflow store is responsible for owning the application's workflow
state and domain mutations. Don't treat the React Flow instance as the
primary source of truth for persistent workflow state. Keep the React Flow
representation synchronized with the workflow state according to the
existing architecture.

## Performance

The canvas must support workflows containing hundreds of nodes. Pay
attention to: component rerenders, Zustand selector scope, React Flow
subscriptions, node/edge collection recreation, unnecessary graph updates,
expensive calculations during interaction.

Prefer: `React.memo` when it prevents meaningful rerenders, `useCallback`
when referential stability matters, `useMemo` when computation or
referential stability justifies it, granular Zustand selectors, appropriate
selector equality. Don't add memoization mechanically.

Avoid: subscribing components to the entire workflow state, recreating
large node/edge collections unnecessarily, updating the entire graph while
typing in property panels, unnecessary React Flow instance updates.

## Large graphs

Always consider the cost of an operation on a graph containing hundreds of
nodes. Before implementing a graph operation, consider whether it recreates
the entire nodes/edges array, causes all nodes to rerender, triggers
unnecessary store subscriptions, or performs expensive work on every
keystroke. Prefer targeted updates whenever possible.
