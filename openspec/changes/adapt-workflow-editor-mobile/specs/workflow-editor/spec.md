## ADDED Requirements

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

### Requirement: Minimum touch target size on canvas
Interactive elements on the canvas that a user must activate directly — node connection handles and the edge delete control — SHALL have a touch target of at least 44x44 CSS pixels on viewports below the mobile breakpoint, so they can be reliably activated with a finger.

#### Scenario: Node handle is reachable by touch
- **WHEN** the editor is below the mobile breakpoint and a node is rendered on the canvas
- **THEN** each of its connection handles has a touch-activatable area of at least 44x44 CSS pixels

#### Scenario: Edge delete control is reachable by touch
- **WHEN** the editor is below the mobile breakpoint and an edge is selected or hovered
- **THEN** its delete control has a touch-activatable area of at least 44x44 CSS pixels
