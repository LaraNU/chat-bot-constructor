## Purpose

Defines the rules the workflow graph must satisfy to be considered valid, and how violations are reported to the editor and the publish flow, so that graphs the runtime cannot execute safely are caught before publishing.

## ADDED Requirements

### Requirement: Cycles without a waiting node are validation errors

Workflow validation SHALL report an error for every node that belongs to a directed cycle made up only of nodes that do not wait for user input (every node type other than `question` and `choice`). All outgoing edges of a node SHALL be considered, including both branches of a `condition` node. Each such node SHALL produce one issue with severity `error`, the code `CYCLE_WITHOUT_WAITING_NODE`, the id of that node, and a translation key for the message. A cycle that contains at least one waiting node SHALL NOT produce this error.

#### Scenario: Two-message cycle is reported on both nodes

- **WHEN** the graph contains `message A → message B → message A`
- **THEN** validation returns `isValid: false` with one `CYCLE_WITHOUT_WAITING_NODE` error for A and one for B

#### Scenario: Self-loop is reported

- **WHEN** a `message` node has an edge to itself
- **THEN** validation returns one `CYCLE_WITHOUT_WAITING_NODE` error for that node

#### Scenario: Cycle through a condition branch is reported

- **WHEN** the graph contains `message A → condition C`, and either branch of C leads back to A without passing a waiting node
- **THEN** validation returns `CYCLE_WITHOUT_WAITING_NODE` errors for A and C

#### Scenario: Cycle through a waiting node is valid

- **WHEN** the graph contains `question Q → condition C → message M → question Q` or `choice H → message M → choice H`
- **THEN** validation returns no `CYCLE_WITHOUT_WAITING_NODE` error

#### Scenario: Acyclic graph is not affected

- **WHEN** the graph contains no cycles
- **THEN** validation returns no `CYCLE_WITHOUT_WAITING_NODE` error

### Requirement: Cycle errors block publishing but not saving

A workflow with a `CYCLE_WITHOUT_WAITING_NODE` error SHALL be treated like any other validation error: the editor SHALL refuse to open the publish dialog, and SHALL still allow the draft to be saved (manually or by autosave) with the existing "saved with errors" feedback.

#### Scenario: Publish is blocked

- **WHEN** the saved draft contains a cycle without a waiting node and the user clicks Publish
- **THEN** the publish dialog does not open and the user sees the validation-failed notification with the error count

#### Scenario: Draft is still saved

- **WHEN** the draft contains a cycle without a waiting node and the user saves manually
- **THEN** the draft is persisted and the user sees the "saved with errors" notification
