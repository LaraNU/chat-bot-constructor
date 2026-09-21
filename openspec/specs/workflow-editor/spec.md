## Purpose

Defines the behavior of the visual workflow editor: dirty tracking, persistence, autosave, and the states communicated to the user during save operations.

## Requirements

### Requirement: isDirty reflects only meaningful graph changes

The editor SHALL track `isDirty` state. `isDirty` SHALL be set to `true` only when the graph data changes in a way that alters the persisted representation: adding a node, removing a node, changing node data, or finishing a node drag (position committed). Transient interactions — node selection, node drag-in-progress — SHALL NOT set `isDirty`.

#### Scenario: Node selection does not mark graph dirty

- **WHEN** the user clicks a node to select it
- **THEN** `isDirty` remains unchanged

#### Scenario: Node drag-in-progress does not mark graph dirty

- **WHEN** the user is dragging a node (position update with `dragging: true`)
- **THEN** `isDirty` remains `false` if it was `false` before the drag started

#### Scenario: Node drop commits position and marks graph dirty

- **WHEN** the user releases a dragged node (position update with `dragging: false`)
- **THEN** `isDirty` becomes `true`

#### Scenario: Node added marks graph dirty

- **WHEN** the user adds a node to the canvas
- **THEN** `isDirty` becomes `true`

#### Scenario: Node removed marks graph dirty

- **WHEN** the user removes a node from the canvas
- **THEN** `isDirty` becomes `true`

### Requirement: Autosave triggers after inactivity

When the editor is open and `isDirty` is `true`, the system SHALL automatically save the workflow after 2 seconds of no further graph changes. Autosave SHALL NOT show a toast notification. Autosave SHALL NOT run if a save operation is already in progress.

#### Scenario: Autosave fires 2 seconds after last change

- **WHEN** the user modifies the graph and stops making changes
- **THEN** the workflow is persisted automatically after 2 seconds

#### Scenario: Autosave resets on subsequent change

- **WHEN** the user makes another graph change before the 2-second timer elapses
- **THEN** the timer resets and autosave fires 2 seconds after the new change

#### Scenario: Autosave skips when already saving

- **WHEN** a save operation is in progress (manual or autosave) and the 2-second timer elapses
- **THEN** the autosave does not start a second concurrent save

#### Scenario: No toast on autosave

- **WHEN** autosave completes successfully
- **THEN** no toast notification is shown to the user

### Requirement: isSaving state is globally visible

The store SHALL expose a boolean `isSaving` flag. `isSaving` SHALL be `true` for the entire duration of any save operation (autosave or manual). Both the save button and any autosave logic SHALL consult `isSaving` before starting a new save.

#### Scenario: isSaving blocks concurrent save

- **WHEN** `isSaving` is `true` and the user clicks the save button
- **THEN** the save is not initiated and the button remains in the saving state

### Requirement: Save button reflects editor state

The save button SHALL have three distinct visual states:

- **Clean** (`isDirty=false`, `isSaving=false`): label "Сохранено", disabled.
- **Dirty** (`isDirty=true`, `isSaving=false`): label "Сохранить", enabled.
- **Saving** (`isSaving=true`): label "Сохраняется…", disabled.

#### Scenario: Button shows clean state after successful save

- **WHEN** a save (manual or autosave) completes and there are no further unsaved changes
- **THEN** the button shows "Сохранено" and is disabled

#### Scenario: Button shows dirty state when changes exist

- **WHEN** `isDirty` is `true` and no save is in progress
- **THEN** the button shows "Сохранить" and is enabled

#### Scenario: Button shows saving state while save is in progress

- **WHEN** `isSaving` is `true`
- **THEN** the button shows "Сохраняется…" and is disabled regardless of `isDirty`

### Requirement: Positions persisted across page reload

Node positions SHALL be part of the saved workflow data. After a successful save (autosave or manual), reloading the page SHALL restore nodes to the positions they had at the time of the save.

#### Scenario: Position survives reload after autosave

- **WHEN** the user moves a node, waits 2 seconds for autosave, then reloads the page
- **THEN** the node appears at the position it was moved to

### Requirement: Responsive editor layout

Below the mobile breakpoint, the editor SHALL NOT render the node palette and the properties panel as permanently visible side panels next to the canvas. Instead, both SHALL be available as toggleable overlay panels that the user opens and closes on demand, so the canvas can occupy the full available width. At or above the mobile breakpoint, the editor SHALL keep its current side-by-side layout (palette, canvas, properties panel) unchanged.

#### Scenario: Narrow viewport hides side panels by default

- **WHEN** the editor is opened at a viewport width below the mobile breakpoint
- **THEN** neither the node palette nor the properties panel is visible by default, and the canvas occupies the full width of the editor

#### Scenario: Opening the palette overlay on a narrow viewport

- **WHEN** the user is below the mobile breakpoint and triggers the control to open the node palette
- **THEN** the node palette is shown as an overlay above the canvas and can be dismissed without navigating away from the editor

#### Scenario: Opening the properties overlay on a narrow viewport

- **WHEN** the user is below the mobile breakpoint, has a node selected, and triggers the control to open the properties panel
- **THEN** the properties panel is shown as an overlay showing that node's properties and can be dismissed without losing the selection

#### Scenario: The properties overlay does not block interacting with the canvas

- **WHEN** the properties overlay is open below the mobile breakpoint
- **THEN** the canvas underneath remains visible (no full-screen backdrop covers it) and continues to receive pointer/touch input, including panning the canvas

Note: the properties overlay auto-opens whenever a node becomes selected (the auto-open behavior is implemented in `views/workflow-editor`). Panning across several nodes on touch can incidentally select one mid-gesture, re-triggering that auto-open. An earlier version of this behavior rendered the overlay as a modal dialog (a full-screen backdrop that blocks and captures all pointer/touch input outside the panel, per Radix Dialog's default `modal={true}`), which meant every incidental selection during panning would pop up a screen-covering backdrop and swallow the user's next touches — from the user's perspective, indistinguishable from "the canvas stopped responding to touch." Fixed by rendering the properties overlay non-modal (`modal={false}`): Radix's own `Dialog.Overlay` renders nothing when non-modal, and outside pointer/touch events are no longer blocked, so a stray auto-open no longer interrupts panning — the panel now dismisses itself on the very touch that continues the pan, rather than absorbing it. The node palette overlay remains modal (it is only ever opened by a deliberate user action, not as a side effect of selection).

#### Scenario: Desktop layout is unaffected

- **WHEN** the editor is opened at a viewport width at or above the mobile breakpoint
- **THEN** the node palette and properties panel render as fixed side panels exactly as before this change, with no overlay behavior

### Requirement: Touch-compatible node creation

The editor SHALL provide a way to add a node to the canvas that does not depend on the HTML5 Drag-and-Drop API, so that nodes can be added on touch input devices where that API does not fire. This mechanism SHALL be available in addition to the existing pointer-based drag-and-drop, which SHALL remain unchanged for pointer/mouse input.

#### Scenario: Adding a node via touch

- **WHEN** a user on a touch input device activates a node type in the palette (e.g. by tapping it) instead of dragging it
- **THEN** a node of that type is added to the canvas within the currently visible viewport, using the same default data and creation logic as a drag-and-drop-created node

#### Scenario: Existing pointer drag-and-drop is preserved

- **WHEN** a user with mouse/pointer input drags a node type from the palette and drops it on the canvas
- **THEN** the node is created exactly as it was before this change, with no behavior difference introduced by the touch-compatible creation path

### Requirement: Minimum touch target size for the edge delete control

The edge delete control SHALL have a touch target of at least 44x44 CSS pixels on viewports below the mobile breakpoint, so it can be reliably activated with a finger.

#### Scenario: Edge delete control is reachable by touch

- **WHEN** the editor is below the mobile breakpoint and an edge is selected or hovered
- **THEN** its delete control has a touch-activatable area of at least 44x44 CSS pixels

### Requirement: Node connection handles stay small and do not encroach on node-drag area

Node connection handles SHALL NOT be enlarged for touch on any viewport. Their interactive box SHALL stay close to React Flow's own default size, on every viewport, so the area around a node's edges remains available for dragging the node itself rather than being claimed by starting a new connection.

#### Scenario: Handle size is uniform across viewports

- **WHEN** the editor is rendered at any viewport width, at or below the mobile breakpoint
- **THEN** node connection handles render at their small, non-enlarged size, identical at every breakpoint

#### Scenario: Dragging a node near its handles still repositions the node

- **WHEN** a user presses down and drags starting from a point on a node's body that is near, but not directly on, one of its connection handles
- **THEN** the node is repositioned, and no connection-drag is started instead

Note: enlarging handles to 44x44 CSS px for touch (matching the edge-delete-control requirement above) was tried and reverted, because React Flow's `Handle` attaches its own connection-start pointer handlers to its full box, and keeps that box interactive (`pointer-events: all` via the `connectionindicator` state) whenever it is connectable and no connection is in progress, which in practice is essentially always. Enlarging the box therefore did not just change its appearance: it enlarged the area around every node edge that starts a new connection instead of dragging the node, which broke node repositioning — most noticeably on the compact Start node. Touch-friendly node *connection* is accepted as a known limitation rather than reintroducing that regression.

### Requirement: Responsive node card width

Below the mobile breakpoint, every node card SHALL narrow to fit within the visible viewport instead of rendering at its fixed desktop width. Node cards SHALL remain inline-editable in this narrowed state — no editable field is removed or moved out of the card as part of narrowing. At or above the mobile breakpoint, node cards SHALL keep their existing fixed desktop widths.

#### Scenario: Node card narrows below the mobile breakpoint

- **WHEN** the editor is below the mobile breakpoint and a node of any type (other than Start) is rendered on the canvas
- **THEN** the node's card width fits within the visible viewport rather than overflowing it, and all of its fields remain visible and editable inline on the card

#### Scenario: Desktop node card width is unaffected

- **WHEN** the editor is at or above the mobile breakpoint
- **THEN** each node card renders at its existing fixed desktop width, unchanged by this requirement

### Requirement: Simplified Start node presentation

The Start node SHALL render as a compact icon-plus-label card ("Start") on all viewports, since it has no editable data. This replaces its previous two-tier header/content layout everywhere, not only below the mobile breakpoint.

#### Scenario: Start node renders compactly on any viewport

- **WHEN** the editor renders the Start node, at any viewport width
- **THEN** it displays only its icon and the "Start" label, with no separate header/content sections and no editable fields
