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
