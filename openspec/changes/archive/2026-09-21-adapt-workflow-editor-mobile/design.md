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

### 6. Node cards narrow via CSS, keeping inline editing (not a compact-summary redesign)
Manual verification surfaced that fixed desktop card widths (`w-64`/`w-80`/`w-96`) were the real reason the editor still felt broken on a phone even after the panel and tap-to-add work: a single node card wider than the viewport dominates the whole screen. Two shapes were considered:

- **Narrow the existing card via a responsive Tailwind width override, keep inline editing** (chosen). Each node file's fixed width class gains a shared `max-md:` override (e.g. `max-md:w-[85vw] max-md:max-w-xs`), capping card width to fit small viewports. No node's internal markup changes — `EditorField`/`ControlledTextarea`/`Select`/etc. already fill their container with `w-full`, so they reflow naturally under a narrower parent. Low risk, no change to what a node can do on mobile vs desktop.
- **Compact "summary" cards on mobile, full editing moved into the properties panel only.** Rejected for this iteration — it changes the editing model itself (inline editing disappears below the breakpoint), which is a bigger behavioral shift than "make it fit." The properties panel already auto-opens on node selection (Decision 2), so it remains available as a secondary editing surface without forcing it as the only one.

The width override lives alongside `NODE_HANDLE_SIZE_CLASSNAME` as a second shared constant in `entities/workflow/ui/nodes`, applied via `cn()` next to each node's existing fixed-width class — same pattern, same file, no new abstraction layer.

### 7. Start node collapses to icon + label unconditionally, not just on mobile
The Start node carries no editable data (`StartNodeData` is `{}`) — its header/content two-tier layout only ever existed to stay visually consistent with other node cards, at the cost of unnecessary width and vertical space. Rather than branching its rendering on `useMediaQuery` (mobile-only compact form, desktop form unchanged), it renders as a single compact icon+label pill on every viewport. This is a strict simplification with no lost functionality on either breakpoint, so there is no reason to keep two code paths or two visual forms for it.

### 8. Edge delete button gets a 44px touch target; node handles do not (reverted after breaking node dragging)
The edge delete button's touch target is enlarged via a responsive Tailwind variant on the button in `custom-edge.tsx` (`max-md:p-[11px]`) — a pure visual/hit-area change, CSS-only, no `useMediaQuery` needed.

Node connection handles were enlarged the same way at first (`max-md:!size-11`, 44px) and reverted after manual testing showed nodes could no longer be dragged on the canvas, most noticeably the compact Start node. Root cause, confirmed by reading `@xyflow/react`'s `Handle` source: `Handle` attaches its own `onMouseDown`/`onTouchStart` to its whole box to start a connection drag, and adds a `connectionindicator` class (`pointer-events: all`) whenever `isConnectable && !connectionInProcess` — which is true in the idle state on essentially every render, not just on hover. Enlarging the handle's box therefore doesn't just change its appearance: it enlarges the area around every node edge that starts a new connection instead of dragging the node. At 44px this ate enough of the edge area to make dragging unreliable; the shorter/narrower a node (worst case: the compact Start node), the more of it that 44px band covers.

Fix: node handles get an explicit small size (`!size-[5px]`, close to React Flow's own 6px default) applied uniformly at every viewport, not enlarged for touch at all. This is a conscious trade-off, not an oversight: reliably repositioning a node is a more frequent, more fundamental interaction than starting a connection from a precise point, so it wins when the two are in tension. Precisely tapping a 5–6px connection point on a touch screen remains a known limitation — see spec.md's "Node connection handles stay small and do not encroach on node-drag area" requirement for the accepted scope, and the Risks section below for why a further fix wasn't attempted in this change.

### 9. Properties overlay is non-modal, not modal (reverted after it blocked canvas panning)
Manual testing surfaced a second regression tied to decision 2's auto-open behavior: panning across a chain of nodes on touch routinely brushes against a node mid-gesture, which selects it and (per decision 2) auto-opens the properties overlay. The overlay was initially a modal Radix Dialog — `modal={true}` is the `Sheet`/`Dialog.Root` default — which renders a full-screen `Overlay` backdrop that both visually covers the canvas and, more importantly, blocks all pointer/touch events outside the panel content (`disableOutsidePointerEvents` in Radix's `DialogContentModal`). Every incidental selection during a pan gesture therefore popped up a screen-covering, input-blocking backdrop, which read to the user as "the canvas stopped responding to touch" — not a cosmetic issue, a hard interaction blocker.

Fix: render the properties `Sheet` with `modal={false}`. Confirmed by reading `@radix-ui/react-dialog`'s source (`DialogOverlay`: `return context.modal ? <Overlay/> : null`) that this requires no change to the shared `sheet.tsx` primitive — Radix's own `Dialog.Overlay` already renders nothing when non-modal, and `DialogContentNonModal` sets `disableOutsidePointerEvents: false` and `trapFocus: false`, so the canvas underneath keeps receiving pointer/touch input while the panel is open. Dismissal still works: `DismissableLayer`'s `onDismiss` (wired to `onOpenChange(false)`) fires on outside pointer-down regardless of `modal`, so touching the canvas to keep panning also closes the stray panel in the same gesture, rather than requiring a separate dismiss step.

Scope: only `PropertiesPanel`'s `Sheet` changes. `NodesPalette`'s `Sheet` stays modal — it is only ever opened by a deliberate tap on a header toggle or tap-to-add's own flow, never as a side effect of node selection, so it never intercepts an in-progress gesture the way the properties overlay did.

Alternative considered: change the auto-open behavior itself (decision 2) to ignore incidental selections during a pan gesture, or drop auto-open entirely. Not pursued — harder to get right (distinguishing "incidental" from "intentional" selection requires plumbing gesture state that doesn't exist today), and non-modal already removes the actual harm (blocked input); an occasional panel flicker while panning is a cosmetic residual, not a functional one.

## Risks / Trade-offs

- **[Risk] `useMediaQuery` reads `window.matchMedia`, unavailable during SSR** → Mitigation: hook defaults to `false` (desktop/mouse assumption) until the first client effect runs, matching the existing project convention of graceful client-only enhancement; accepted one-frame flash on mobile rather than a hydration error.
- **[Risk] `(pointer: coarse)` imprecisely represents hybrid devices** (e.g., a touchscreen laptop whose primary pointer is a mouse/trackpad) → Mitigation: this is the standard, idiomatic feature test for this exact problem class and is explicitly called out as a non-goal to chase further; desktop-with-touch users still have working mouse drag-and-drop as a fallback.
- **[Risk] Refactoring `use-canvas-drag-drop.ts` touches an existing, working interaction** → Mitigation: the hook's external contract (`onDragOver`, `onDrop`) stays identical; only the internal creation logic is factored out, covered by existing/updated unit tests before the tap-to-add path is added on top.
- **[Risk] Growing `shared/ui` with a new `Sheet` primitive** → Mitigation: it is a small, general-purpose composition of an already-used Radix dependency (mirrors `dialog.tsx` 1:1 in structure), not a one-off; future features needing a side panel can reuse it instead of duplicating.
- **[Non-risk / by construction] Performance**: overlay open/close state is local view state, isolated from the Zustand workflow store and the `nodes`/`edges` arrays — toggling it cannot trigger the store-wide rerenders `react-flow.md` warns against, so no extra memoization work is required for this change specifically.
- **[Accepted limitation] Connection handles remain small (~5px) on touch, per decision 8** → Not mitigated in this change. A hit-slop technique (small visible dot, larger invisible tappable area via e.g. `background-clip: content-box` + padding, so the *visual* size stays small while the *interactive* box only grows where it doesn't overlap the node's own draggable area) could reconcile both concerns, but is a more invasive change to a shared, delicate piece of interaction (React Flow's own `Handle` internals) than this change's scope warrants after two iterations already went back and forth here. Left as a follow-up, not attempted now.
- **[Unrelated pre-existing issue, noted for visibility]** `npm run dev` currently throws a CSP `EvalError` in the browser console (`script-src` lacks `'unsafe-eval'`, which Next.js's Fast Refresh runtime requires), introduced by the unrelated `security-headers` capability. This breaks Fast Refresh reliability during manual dev-mode testing — it does not affect `next build && next start`, which is unaffected and was used for this change's manual verification. Out of scope for this change; tracked separately.

## Migration Plan

Pure frontend change, no data migration, no schema change, no feature flag needed: every new code path is gated by `useMediaQuery`/`pointer: coarse`, so desktop mouse users are on the exact pre-change code path and see zero behavior difference. Roll out as a normal deploy. Before merge, manually verify on a real touch device or browser device-emulation mode (per `code-quality-and-testing.md`, this is a UI change that must be exercised in a browser, not just covered by unit tests) covering: opening/closing both overlays, tap-to-add for every node type, edge deletion by touch, and confirming desktop layout/drag-and-drop are pixel-for-pixel unchanged. No rollback complexity beyond reverting the change — nothing persisted changes shape.

## Open Questions

- Exact mobile breakpoint pixel value (proposed default: Tailwind's `md` boundary, 768px, since that's already the project's implicit "two-column-no-longer-fits" width elsewhere). This is a single constant and can be tuned later based on real usage data without touching the spec, the approach, or any task.
