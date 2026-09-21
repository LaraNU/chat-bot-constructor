## 1. Shared responsive infrastructure

- [x] 1.1 Add the mobile breakpoint constant (media query string, e.g. `(max-width: 767px)`) to `src/shared/config` and verify it's exported and imported without a circular dependency
- [x] 1.2 Implement `useMediaQuery(query: string)` in `src/shared/lib/hooks/use-media-query.ts` (SSR-safe: returns `false` until mounted, subscribes to `matchMedia(query).change`) and export it from `src/shared/lib/hooks/index.ts`; verify with a unit test that mocks `window.matchMedia` and confirms the hook returns the initial state then updates on a simulated change event
- [x] 1.3 Build `src/shared/ui/sheet.tsx` (`Sheet`, `SheetTrigger`, `SheetContent` with a `side: 'left' | 'right'` prop, `SheetHeader`, `SheetTitle`, `SheetClose`) on top of `@radix-ui/react-dialog`, mirroring the composition of `src/shared/ui/dialog.tsx`; verify by rendering it in isolation (e.g. Storybook-less smoke test or a temporary test page) and confirming open/close, ESC-to-close, and outside-click-to-close all work

## 2. Responsive editor layout

- [x] 2.1 In `views/workflow-editor/ui/workflow-editor-page.tsx`, add local `isPaletteOpen`/`isPropertiesOpen` state to `EditorContent`, read `useMediaQuery(MOBILE_BREAKPOINT_QUERY)`, and branch the layout: unchanged fixed `flex` row at/above the breakpoint, full-width canvas with both panels hidden by default below it; verify by rendering the page at a narrow viewport in a browser and confirming only the canvas is visible initially
- [x] 2.2 Wrap `NodesPalette`'s content in the new `Sheet` (`side="left"`) when below the breakpoint, keeping the existing fixed `<aside>` rendering unchanged at/above it; verify the palette list renders identically in both modes (same items, same translations)
- [x] 2.3 Wrap `PropertiesPanel`'s content in the new `Sheet` (`side="right"`) when below the breakpoint; verify selecting a node still shows `NodePropertiesRouter` inside the sheet, and `EmptyState` when nothing is selected
- [x] 2.4 Auto-open the properties sheet when a node becomes selected while below the breakpoint, driven by the existing `useSelectedNode()` selector (no new store state); verify by tapping a node on a narrow viewport and confirming the properties sheet opens without an extra manual toggle
- [x] 2.5 Add "open palette" / "open properties" toggle controls to `EditorHeader`, visible only below the breakpoint; verify they open/close the corresponding sheet and are absent in the desktop layout
- [x] 2.6 Add the required i18n keys for any new user-facing strings (toggle button labels, sheet titles) to `shared/langs/en.json` and `shared/langs/ru.json`, reusing existing `WorkflowEditor`/`PropertiesPanel` translation namespaces where the text already exists; verify no hardcoded strings remain in the new/changed components
- [x] 2.7 Fix: render `PropertiesPanel`'s mobile `Sheet` with `modal={false}` — the modal default made the auto-open behavior from 2.4 pop a full-screen, input-blocking backdrop every time panning across a chain of nodes incidentally selected one mid-gesture, which made the canvas appear entirely unresponsive to touch; verify Radix's `Dialog.Overlay` renders nothing when non-modal (no `[data-slot="sheet-overlay"]` in the DOM while open) and that `NodesPalette`'s `Sheet` is untouched (stays modal); covered by `properties-panel.test.tsx`

## 3. Touch-compatible node creation

- [x] 3.1 In `features/drag-drop-node/model/use-canvas-drag-drop.ts`, extract the existing node-construction logic (`getDefaultNodeData` + `CustomAppNode` assembly + `setNodes` call) out of `onDrop` into an internal `createNodeAtPosition(type, position)` function, keeping `onDrop`'s external behavior identical; verify existing tests/usages of `useCanvasDragDrop` still pass unchanged
- [x] 3.2 Add `onTapAdd(type: WorkflowNodeType)` to the same hook, computing the target position from the current React Flow viewport center (via `useReactFlow`) and calling `createNodeAtPosition`; verify with a unit test that calling `onTapAdd('message')` adds exactly one message node with default data to the nodes array
- [x] 3.3 In `NodesPalette`, add an `onClick` handler per node entry that calls `onTapAdd` only when `useMediaQuery('(pointer: coarse)')` is true, leaving `draggable`/`onDragStart` untouched; verify manually on a touch-emulated browser session that tapping a palette entry adds a node to the canvas, and confirm no `onClick` firing changes observed on mouse-only sessions — confirmed manually by the user
- [x] 3.4 Verify the desktop drag-and-drop path end-to-end after the refactor (drag a node type from the palette, drop it on the canvas, confirm it is created at the drop position exactly as before this change) — confirmed manually by the user

## 4. Touch target sizing

- [x] ~~4.1 Increase the hit area of `Handle` (`@xyflow/react`) on all custom nodes in `entities/workflow/ui/nodes/*` to at least 44×44 CSS px below the mobile breakpoint~~ — **reverted, see 4.4**: this broke node dragging on the canvas (confirmed root cause: `Handle` keeps its connection-start pointer handlers active on its full box essentially all the time, so a bigger box claims more of the node edge for "start a connection" instead of "drag the node")
- [x] 4.2 Increase the edge delete button's hit area in `entities/workflow/ui/edge/custom-edge.tsx` to at least 44×44 CSS px below the mobile breakpoint; verify by tapping the delete control on a touch-emulated session and confirming reliable activation
- [x] 4.3 Confirm no visual/size regression above the mobile breakpoint for the edge delete button (desktop screenshot/before-after comparison) — confirmed manually by the user
- [x] 4.4 Revert node handle sizing: replace the enlarged mobile-only handle size with `NODE_HANDLE_SIZE_CLASSNAME` (`!size-[5px]`, close to React Flow's own 6px default), applied uniformly at every viewport (no `max-md:` branching) on all 7 node files; verify via `next build` that no `size-11`/44px handle rule remains in the compiled CSS and that dragging a node from a point near its handle repositions the node rather than starting a connection

## 5. Responsive node card width

- [x] 5.1 Add a shared `RESPONSIVE_NODE_WIDTH_CLASSNAME` constant next to `NODE_HANDLE_SIZE_CLASSNAME` in `entities/workflow/ui/nodes` (e.g. `max-md:w-[85vw] max-md:max-w-xs`) and apply it via `cn()` alongside the existing fixed width class (`w-64`/`w-80`/`w-96`) on every node type except Start (`message-node.tsx`, `question-node.tsx`, `choice-node.tsx`, `condition-node.tsx`, `end-node.tsx`, `summary-node.tsx`); verify with `next build` that the compiled CSS contains one `max-md:` width override per usage and no desktop width class is removed
- [x] 5.2 Verify manually at a narrow viewport that every non-Start node card fits within the visible width and all inline fields (textarea/select/inputs) remain visible and usable without horizontal overflow — confirmed manually by the user
- [x] 5.3 Verify manually at a viewport at/above the mobile breakpoint that every node card renders at its original fixed width, unchanged — confirmed manually by the user

## 6. Simplified Start node

- [x] 6.1 Rewrite `entities/workflow/ui/nodes/start-node.tsx` to render a single compact card (icon + `t('name')` label only), removing the `BaseNodeHeader`/`BaseNodeContent` two-tier layout and the description line, applied unconditionally (no viewport branching); keep the existing source `Handle` with `NODE_HANDLE_SIZE_CLASSNAME`
- [x] 6.2 Verify manually that the Start node renders as the compact icon+label form at both a desktop and a mobile viewport width, with its outgoing connection still working — confirmed manually by the user
- [x] 6.3 Check whether `WorkflowEditor.nodes.start.description` is still referenced anywhere after this change; if not, leave the translation key in place only if removing it would be an unrelated cleanup beyond this task's scope (do not silently delete translation keys as a side effect) — confirmed no remaining references (grep across `src`), removed the now-orphaned key from `en.json`/`ru.json` since it is a direct consequence of this task, not unrelated cleanup

## 7. Verification

- [x] 7.1 Run the full unit test suite and confirm no regressions in `entities/workflow`, `features/drag-drop-node`, and `shared/lib/hooks`
- [x] 7.2 Manually exercise the full mobile flow in a real touch device or browser device-emulation mode: open editor → add each node type via tap → connect nodes → edit properties via the properties sheet → delete an edge via touch → confirm autosave still triggers and the save button reflects dirty/saving/clean states per the unchanged `workflow-editor` save-state requirements — confirmed manually by the user, including the node-drag and canvas-pan regressions found and fixed during this pass (see 2.7 and 4.4)
- [x] 7.3 Manually confirm the desktop experience is pixel-for-pixel unchanged: side panels always visible, drag-and-drop node creation, default handle/edge-button sizes — confirmed manually by the user
