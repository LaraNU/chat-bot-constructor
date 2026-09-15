## Why

The workflow editor (`/editor/[id]`) is unusable on mobile and touch devices today. Adding a node to the graph relies exclusively on the native HTML5 Drag-and-Drop API (`nodes-palette.tsx` → `use-canvas-drag-drop.ts`), which does not fire `dragstart`/`drop` events on touch input at all — so touch users cannot add nodes to a workflow, period. On top of that, the editor layout hard-codes two fixed-width side panels (`NodesPalette` at `w-64`, `PropertiesPanel` at `w-72`) flanking the canvas with no responsive behavior, no breakpoint logic, and no `useMediaQuery`-style infrastructure anywhere in the codebase. The result is that anyone opening the editor on a phone gets a broken, unusable screen rather than a degraded-but-functional one.

## What Changes

- Add a shared `useMediaQuery` hook (`src/shared/lib/hooks`) as the single source of truth for responsive/breakpoint decisions, reused by the editor layout and by the touch-based node-add fallback.
- Add a touch-compatible way to add nodes to the canvas ("tap-to-add": tapping a palette entry inserts the node into the current canvas viewport) as an **addition** alongside the existing desktop drag-and-drop, which is left untouched.
- Make the editor layout (`EditorContent` in `workflow-editor-page.tsx`) responsive: below the mobile breakpoint, `NodesPalette` and `PropertiesPanel` collapse into toggleable overlay panels instead of permanently occupying horizontal space next to the canvas.
- Add toolbar controls in `EditorHeader` (or equivalent) to open/close the palette and properties overlay panels on mobile.
- Increase touch target size for interactive canvas elements that currently assume a mouse pointer (node handles, edge delete affordance in `custom-edge`), to meet a minimum comfortable touch-target size.
- No changes to workflow persistence, autosave, save-button states, or any other behavior already covered by the `workflow-editor` spec — this change is additive to presentation/interaction, not to save semantics.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `workflow-editor`: adds requirements for responsive layout and touch-compatible node creation on small/touch viewports. Existing requirements (dirty tracking, autosave, save-button states, position persistence) are unaffected.

## Impact

- **Affected code**: `src/views/workflow-editor/ui/workflow-editor-page.tsx`, `src/widgets/nodes-palette/ui/nodes-palette.tsx`, `src/widgets/properties-panel/ui/properties-panel.tsx`, `src/widgets/editor-header/ui/editor-header.tsx`, `src/features/drag-drop-node/model/use-canvas-drag-drop.ts` (new sibling touch-add action, existing drop handler untouched), `src/entities/workflow` (custom edge / node handle touch-target sizing), `src/shared/lib/hooks` (new `useMediaQuery`).
- **No backend/API impact**: this is purely an editor presentation/interaction change; `Flow`/`FlowSnapshot` persistence, server actions, and the Telegram runtime are untouched.
- **No breaking changes**: desktop behavior (drag-and-drop, fixed side panels) is preserved unchanged above the mobile breakpoint.
- **New dependency risk**: none required — the plan intentionally avoids a native-DnD library swap (e.g. dnd-kit) for this iteration to keep the change additive and low-risk; that remains a possible future follow-up, not part of this change.
