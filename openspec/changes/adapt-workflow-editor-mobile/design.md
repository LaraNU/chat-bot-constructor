## Context

See `proposal.md` - Why for motivation. Relevant current-state constraints:

- The editor (`workflow-editor-page.tsx`) renders `NodesPalette` (`w-64`), `WorkflowCanvas`, and `PropertiesPanel` (`w-72`) as three siblings in a single `flex` row, with no breakpoint logic anywhere in the tree.
- Node creation via drag-and-drop uses the native HTML5 DnD API (`draggable`/`dragstart` in `nodes-palette.tsx`, `dataTransfer`/`drop` in `use-canvas-drag-drop.ts`), which does not fire on touch input.
- The workflow Zustand store (`entities/workflow/model/store`) is a per-instance vanilla store scoped to workflow domain data (nodes, edges, dirty/saving flags). Panel-open/closed state is UI-only and has no natural home there (`workflow-editor.md`: "presentation components should not contain workflow domain logic" implies the inverse too — domain state should not carry UI-only concerns).
- `shared/ui` already wraps Radix primitives (`dialog.tsx` wraps `@radix-ui/react-dialog` as a centered modal); there is no side/bottom-anchored "sheet" primitive yet, and no `useMediaQuery`-style hook in `shared/lib/hooks`.
- Node handles (`@xyflow/react` `Handle`) and the edge delete button (`entities/workflow/ui/edge/custom-edge.tsx`) are sized for pointer/mouse precision, not finger touch.

## Goals / Non-Goals

**Goals:**
- Make the editor fully operable on a touch/small viewport: adding nodes, selecting them, editing their properties, connecting/removing edges.
- Keep 100% of current desktop behavior (layout, drag-and-drop, hit areas) unchanged above the mobile breakpoint.
- Introduce reusable, generic primitives (`useMediaQuery`, a side-anchored `Sheet`) rather than one-off mobile-only code paths, since responsive needs will recur elsewhere in the product.

**Non-Goals:**
- Replacing the HTML5 Drag-and-Drop API with a pointer-events library (e.g. dnd-kit) to get native touch drag-and-drop. Tap-to-add is a deliberately simpler, lower-risk mechanism for this iteration; a full DnD library swap is a separate future decision if drag-reordering on touch is ever required.
- Redesigning the visual language of the palette/properties panels beyond what's needed to work as overlays.
- Any change to workflow persistence, autosave, save-button states, or the `Flow`/`FlowSnapshot`/Telegram runtime contracts.
- Optimizing for every possible hybrid input device (e.g., touchscreen laptops with a precise trackpad); see Risks below.

## Decisions

### 1. One generic `useMediaQuery(query: string)` hook, not a hardcoded `useIsMobile()`
Add `src/shared/lib/hooks/use-media-query.ts`, following the existing hook conventions in that folder (`use-debounce.ts`): a small, generic, SSR-safe wrapper around `window.matchMedia`, defaulting to `false` until mounted (avoids hydration mismatch — the server has no viewport/pointer info) and subscribing to the media query's `change` event.

This single hook backs two distinct concerns, kept separate on purpose:
- **Layout branching** — `useMediaQuery(MOBILE_BREAKPOINT_QUERY)` (viewport width), used to decide whether the palette/properties panels render as fixed side panels or as overlays.
- **Input-capability branching** — `useMediaQuery('(pointer: coarse)')`, used to decide whether tap-to-add is offered, independent of viewport width.

Alternative considered: a single `useIsMobile()` hook conflating "narrow screen" and "touch device." Rejected — a touch laptop with a wide external monitor and a narrow desktop browser window are different situations; conflating them would make the tap-to-add requirement (which is about input capability) accidentally depend on window width, and vice versa for the layout requirement.

The mobile breakpoint itself is a single named constant (not a magic number), placed in `src/shared/config` per the project's no-magic-numbers rule, expressed as the matching `(max-width: …)` media query string so both the hook and any CSS stay aligned to one source of truth.

### 2. Panel-open/closed state lives in the view layer, not the workflow store
The palette/properties "is this overlay open" boolean(s) are owned by `WorkflowEditorPage`/`EditorContent` (`views/workflow-editor`) as local component state, passed down to `NodesPalette`, `PropertiesPanel`, and the toggle controls added to `EditorHeader`. Selecting a node already opens "properties" conceptually (there's content to show); on mobile this is reflected by auto-expanding the properties overlay on node selection, still driven by the existing `useSelectedNode()` selector, not new store state.

Alternative considered: adding `isPaletteOpen`/`isPropertiesOpen` to the Zustand workflow store. Rejected — that store's documented responsibility is workflow domain state and mutations (`workflow-editor.md`); UI-chrome visibility has no serialization/persistence/autosave relevance and doesn't belong in a store whose growth is governed by "hundreds of nodes" performance rules (`react-flow.md`). Keeping it as view-local `useState` also means it can never accidentally get included in save/dirty-tracking logic.

### 3. A new `Sheet` primitive in `shared/ui`, built on the existing Radix Dialog dependency
Add `src/shared/ui/sheet.tsx` following the exact composition pattern of the existing `dialog.tsx` (same `@radix-ui/react-dialog` primitives — `Root`, `Trigger`, `Portal`, `Overlay`, `Content`, `Close`, `Title`, `Description` — already a project dependency), but with `SheetContent` anchored to an edge (`side: 'left' | 'right'`) and slide-in/out transforms instead of the centered scale/fade used by `Dialog`. This gets focus trapping, ESC-to-close, and outside-click-to-close for free from Radix, matching the accessibility bar already set by the existing `Dialog`.

`NodesPalette` renders inside a left-anchored `Sheet` on mobile; `PropertiesPanel` inside a right-anchored `Sheet`. Both components keep their existing internal content unchanged — only the wrapping container differs based on `useMediaQuery`.

Alternatives considered:
- **Reuse `Dialog` as-is (centered modal)** for the mobile palette/properties. Rejected as lower quality: a centered modal for a persistent side-panel-like tool doesn't match the interaction users already expect from the desktop layout, and offers no side-anchor visual continuity.
- **Hand-rolled `<div>` overlay with manual transforms and manual focus handling.** Rejected — reinvents accessibility behavior (focus trap, ESC, outside click) that Radix already provides for `Dialog` elsewhere in the app; inconsistent with "reuse existing UI primitives" (`frontend.md`).

### 4. Tap-to-add extends `features/drag-drop-node`, sharing node-creation logic with drop
`use-canvas-drag-drop.ts` currently inlines node construction (`getDefaultNodeData` + building the `CustomAppNode` + `setNodes`) inside `onDrop`. This gets factored into a single internal `createNodeAtPosition(type, position)` function used by both:
- the existing `onDrop` handler (position derived from the drop event via `screenToFlowPosition`, unchanged), and
- a new `onTapAdd(type)` handler (position derived from the current viewport center via `useReactFlow` — e.g. `getViewport()` combined with the canvas container's bounding box, converted with `screenToFlowPosition`), exposed from the same hook/feature and wired into `NodesPalette`'s click handler when `pointer: coarse` is true.

This avoids duplicating node-creation logic (`react-flow.md` — "Graph mutations… don't duplicate… between React Flow callbacks"), and keeps the change inside the feature slice that already owns "turn a palette interaction into a new canvas node" rather than creating a parallel feature.

`NodesPalette` itself gains an `onClick` alongside the existing `draggable`/`onDragStart`, gated by the same `pointer: coarse` check — so mouse users see no behavior change (click still won't fire during a drag gesture) and touch users get a working tap interaction where drag never worked.

### 5. Touch target sizing is CSS-only, no JS branching
Enlarging node connection handles and the edge delete button to a 44×44px minimum below the mobile breakpoint is a pure visual/hit-area change, expressible entirely with a responsive Tailwind variant (e.g. `max-md:` sized utility classes / padding) on the existing `Handle` and the button in `custom-edge.tsx`. No `useMediaQuery` call is introduced for this — CSS media queries already do this job without a JS round-trip or hydration concerns, and it composes with decision #1 by sharing the same breakpoint value (kept in the one shared constant/Tailwind screen, not re-declared).

## Risks / Trade-offs

- **[Risk] `useMediaQuery` reads `window.matchMedia`, unavailable during SSR** → Mitigation: hook defaults to `false` (desktop/mouse assumption) until the first client effect runs, matching the existing project convention of graceful client-only enhancement; accepted one-frame flash on mobile rather than a hydration error.
- **[Risk] `(pointer: coarse)` imprecisely represents hybrid devices** (e.g., a touchscreen laptop whose primary pointer is a mouse/trackpad) → Mitigation: this is the standard, idiomatic feature test for this exact problem class and is explicitly called out as a non-goal to chase further; desktop-with-touch users still have working mouse drag-and-drop as a fallback.
- **[Risk] Refactoring `use-canvas-drag-drop.ts` touches an existing, working interaction** → Mitigation: the hook's external contract (`onDragOver`, `onDrop`) stays identical; only the internal creation logic is factored out, covered by existing/updated unit tests before the tap-to-add path is added on top.
- **[Risk] Growing `shared/ui` with a new `Sheet` primitive** → Mitigation: it is a small, general-purpose composition of an already-used Radix dependency (mirrors `dialog.tsx` 1:1 in structure), not a one-off; future features needing a side panel can reuse it instead of duplicating.
- **[Non-risk / by construction] Performance**: overlay open/close state is local view state, isolated from the Zustand workflow store and the `nodes`/`edges` arrays — toggling it cannot trigger the store-wide rerenders `react-flow.md` warns against, so no extra memoization work is required for this change specifically.

## Migration Plan

Pure frontend change, no data migration, no schema change, no feature flag needed: every new code path is gated by `useMediaQuery`/`pointer: coarse`, so desktop mouse users are on the exact pre-change code path and see zero behavior difference. Roll out as a normal deploy. Before merge, manually verify on a real touch device or browser device-emulation mode (per `code-quality-and-testing.md`, this is a UI change that must be exercised in a browser, not just covered by unit tests) covering: opening/closing both overlays, tap-to-add for every node type, edge deletion by touch, and confirming desktop layout/drag-and-drop are pixel-for-pixel unchanged. No rollback complexity beyond reverting the change — nothing persisted changes shape.

## Open Questions

- Exact mobile breakpoint pixel value (proposed default: Tailwind's `md` boundary, 768px, since that's already the project's implicit "two-column-no-longer-fits" width elsewhere). This is a single constant and can be tuned later based on real usage data without touching the spec, the approach, or any task.
