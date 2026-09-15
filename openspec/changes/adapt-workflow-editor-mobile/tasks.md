## 1. Shared responsive infrastructure

- [ ] 1.1 Add the mobile breakpoint constant (media query string, e.g. `(max-width: 767px)`) to `src/shared/config` and verify it's exported and imported without a circular dependency
- [ ] 1.2 Implement `useMediaQuery(query: string)` in `src/shared/lib/hooks/use-media-query.ts` (SSR-safe: returns `false` until mounted, subscribes to `matchMedia(query).change`) and export it from `src/shared/lib/hooks/index.ts`; verify with a unit test that mocks `window.matchMedia` and confirms the hook returns the initial state then updates on a simulated change event
- [ ] 1.3 Build `src/shared/ui/sheet.tsx` (`Sheet`, `SheetTrigger`, `SheetContent` with a `side: 'left' | 'right'` prop, `SheetHeader`, `SheetTitle`, `SheetClose`) on top of `@radix-ui/react-dialog`, mirroring the composition of `src/shared/ui/dialog.tsx`; verify by rendering it in isolation (e.g. Storybook-less smoke test or a temporary test page) and confirming open/close, ESC-to-close, and outside-click-to-close all work

## 2. Responsive editor layout

- [ ] 2.1 In `views/workflow-editor/ui/workflow-editor-page.tsx`, add local `isPaletteOpen`/`isPropertiesOpen` state to `EditorContent`, read `useMediaQuery(MOBILE_BREAKPOINT_QUERY)`, and branch the layout: unchanged fixed `flex` row at/above the breakpoint, full-width canvas with both panels hidden by default below it; verify by rendering the page at a narrow viewport in a browser and confirming only the canvas is visible initially
- [ ] 2.2 Wrap `NodesPalette`'s content in the new `Sheet` (`side="left"`) when below the breakpoint, keeping the existing fixed `<aside>` rendering unchanged at/above it; verify the palette list renders identically in both modes (same items, same translations)
- [ ] 2.3 Wrap `PropertiesPanel`'s content in the new `Sheet` (`side="right"`) when below the breakpoint; verify selecting a node still shows `NodePropertiesRouter` inside the sheet, and `EmptyState` when nothing is selected
- [ ] 2.4 Auto-open the properties sheet when a node becomes selected while below the breakpoint, driven by the existing `useSelectedNode()` selector (no new store state); verify by tapping a node on a narrow viewport and confirming the properties sheet opens without an extra manual toggle
- [ ] 2.5 Add "open palette" / "open properties" toggle controls to `EditorHeader`, visible only below the breakpoint; verify they open/close the corresponding sheet and are absent in the desktop layout
- [ ] 2.6 Add the required i18n keys for any new user-facing strings (toggle button labels, sheet titles) to `shared/langs/en.json` and `shared/langs/ru.json`, reusing existing `WorkflowEditor`/`PropertiesPanel` translation namespaces where the text already exists; verify no hardcoded strings remain in the new/changed components

## 3. Touch-compatible node creation

- [ ] 3.1 In `features/drag-drop-node/model/use-canvas-drag-drop.ts`, extract the existing node-construction logic (`getDefaultNodeData` + `CustomAppNode` assembly + `setNodes` call) out of `onDrop` into an internal `createNodeAtPosition(type, position)` function, keeping `onDrop`'s external behavior identical; verify existing tests/usages of `useCanvasDragDrop` still pass unchanged
- [ ] 3.2 Add `onTapAdd(type: WorkflowNodeType)` to the same hook, computing the target position from the current React Flow viewport center (via `useReactFlow`) and calling `createNodeAtPosition`; verify with a unit test that calling `onTapAdd('message')` adds exactly one message node with default data to the nodes array
- [ ] 3.3 In `NodesPalette`, add an `onClick` handler per node entry that calls `onTapAdd` only when `useMediaQuery('(pointer: coarse)')` is true, leaving `draggable`/`onDragStart` untouched; verify manually on a touch-emulated browser session that tapping a palette entry adds a node to the canvas, and confirm no `onClick` firing changes observed on mouse-only sessions
- [ ] 3.4 Verify the desktop drag-and-drop path end-to-end after the refactor (drag a node type from the palette, drop it on the canvas, confirm it is created at the drop position exactly as before this change)

## 4. Touch target sizing

- [ ] 4.1 Increase the hit area of `Handle` (`@xyflow/react`) on all custom nodes in `entities/workflow/ui/nodes/*` to at least 44×44 CSS px below the mobile breakpoint using a responsive Tailwind class shared across node components (introduce a shared class/utility rather than repeating it per node file); verify by inspecting computed size in browser dev tools at a narrow viewport
- [ ] 4.2 Increase the edge delete button's hit area in `entities/workflow/ui/edge/custom-edge.tsx` to at least 44×44 CSS px below the mobile breakpoint; verify by tapping the delete control on a touch-emulated session and confirming reliable activation
- [ ] 4.3 Confirm no visual/size regression above the mobile breakpoint for both handles and the edge delete button (desktop screenshot/before-after comparison)

## 5. Verification

- [ ] 5.1 Run the full unit test suite and confirm no regressions in `entities/workflow`, `features/drag-drop-node`, and `shared/lib/hooks`
- [ ] 5.2 Manually exercise the full mobile flow in a real touch device or browser device-emulation mode: open editor → add each node type via tap → connect nodes → edit properties via the properties sheet → delete an edge via touch → confirm autosave still triggers and the save button reflects dirty/saving/clean states per the unchanged `workflow-editor` save-state requirements
- [ ] 5.3 Manually confirm the desktop experience is pixel-for-pixel unchanged: side panels always visible, drag-and-drop node creation, default handle/edge-button sizes
