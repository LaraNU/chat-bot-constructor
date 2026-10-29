# workflow-validation Specification

## Purpose

Defines the rules the workflow graph must satisfy to be considered valid, and how violations are reported to the editor and the publish flow, so that graphs the runtime cannot execute safely are caught before publishing.

## Requirements

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

### Requirement: Each node output has at most one outgoing edge

A node output is the single output of a `start`, `message`, `question` or `summary` node, each button of a `choice` node, or each of the `true` and `false` branches of a `condition` node. Workflow validation SHALL report an error for every node output that has more than one outgoing edge. Each such output SHALL produce one issue with severity `error`, the code `MULTIPLE_EDGES_FROM_OUTPUT`, the id of the source node, and a translation key for the message. Edges that differ only by target SHALL be counted separately.

#### Scenario: Message with two outgoing edges is reported

- **WHEN** the graph contains `message A → message B` and `message A → message C`
- **THEN** validation returns `isValid: false` with one `MULTIPLE_EDGES_FROM_OUTPUT` error for A

#### Scenario: Choice button with two edges is reported

- **WHEN** a `choice` node has two edges leaving the same button
- **THEN** validation returns one `MULTIPLE_EDGES_FROM_OUTPUT` error for that `choice` node

#### Scenario: Distinct outputs are valid

- **WHEN** a `condition` node has exactly one `true` edge and one `false` edge, and a `choice` node has exactly one edge per button
- **THEN** validation returns no `MULTIPLE_EDGES_FROM_OUTPUT` error

#### Scenario: Single linear edge is valid

- **WHEN** every `message` node has at most one outgoing edge
- **THEN** validation returns no `MULTIPLE_EDGES_FROM_OUTPUT` error

### Requirement: Message and question nodes require text

Workflow validation SHALL report an error for every `message` or `question` node whose text is empty or contains only whitespace. Each such node SHALL produce one issue with severity `error`, the code `EMPTY_NODE_TEXT`, the id of that node, and a translation key for the message.

#### Scenario: Empty message is reported

- **WHEN** a `message` node has text `""`
- **THEN** validation returns `isValid: false` with one `EMPTY_NODE_TEXT` error for that node

#### Scenario: Whitespace-only question is reported

- **WHEN** a `question` node has text consisting only of spaces and line breaks
- **THEN** validation returns one `EMPTY_NODE_TEXT` error for that node

#### Scenario: Message with attachments but no text is reported

- **WHEN** a `message` node has empty text and a non-empty `attachmentIds` list
- **THEN** validation returns one `EMPTY_NODE_TEXT` error for that node, because attachments are not delivered by the runtime

#### Scenario: Non-empty text is valid

- **WHEN** every `message` and `question` node has non-whitespace text
- **THEN** validation returns no `EMPTY_NODE_TEXT` error

### Requirement: Linear nodes without an exit are reported as warnings

Workflow validation SHALL report a warning for every `message`, `question` or `summary` node that has no outgoing edge, because the dialog would end silently without reaching an `end` node. Each such node SHALL produce one issue with severity `warning`, the code `NODE_HAS_NO_OUTGOING_EDGE`, the id of that node, and a translation key for the message. `start`, `choice` and `condition` nodes SHALL NOT produce this warning, because their missing edges are already reported as errors, and `end` nodes SHALL NOT produce it because they have no outputs.

#### Scenario: Dead-end message is reported

- **WHEN** a `message` node reachable from `start` has no outgoing edge
- **THEN** validation returns one `NODE_HAS_NO_OUTGOING_EDGE` warning for that node and the warning alone does not make `isValid` false

#### Scenario: End node is not reported

- **WHEN** an `end` node has no outgoing edge
- **THEN** validation returns no `NODE_HAS_NO_OUTGOING_EDGE` warning for it

### Requirement: New output and text errors block publishing but not saving

A workflow with a `MULTIPLE_EDGES_FROM_OUTPUT` or `EMPTY_NODE_TEXT` error SHALL be treated like any other validation error: the editor SHALL refuse to open the publish dialog, and SHALL still allow the draft to be saved (manually or by autosave) with the existing "saved with errors" feedback.

#### Scenario: Publish is blocked for a legacy branching draft

- **WHEN** a draft saved before this change has two edges leaving one `message` node and the user clicks Publish
- **THEN** the publish dialog does not open and the user sees the validation-failed notification with the error count

#### Scenario: Draft with an empty message is still saved

- **WHEN** the draft contains a `message` node with empty text and the user saves manually
- **THEN** the draft is persisted and the user sees the "saved with errors" notification
