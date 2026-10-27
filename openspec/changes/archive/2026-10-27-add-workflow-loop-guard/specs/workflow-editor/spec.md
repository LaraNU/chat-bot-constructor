## ADDED Requirements

### Requirement: Canvas rejects connections that close a cycle without a waiting node

While the user drags a new connection on the canvas, the editor SHALL treat the connection as invalid, and SHALL NOT create the edge on release, when adding it would close a directed cycle made up only of nodes that do not wait for user input (every node type other than `question` and `choice`). Connections that close a cycle passing through at least one waiting node, and connections that close no cycle, SHALL remain allowed.

#### Scenario: Closing a message-only cycle is rejected

- **WHEN** the canvas contains `message A → message B` and the user drags a connection from B to A
- **THEN** the connection is shown as invalid and no edge is created when the user releases it

#### Scenario: Self-connection of a non-waiting node is rejected

- **WHEN** the user drags a connection from a `message` node to the same node
- **THEN** the connection is shown as invalid and no edge is created

#### Scenario: Loop back to a question is allowed

- **WHEN** the canvas contains `question Q → message M` and the user drags a connection from M to Q
- **THEN** the edge is created

#### Scenario: Ordinary forward connection is allowed

- **WHEN** the user connects two nodes and the new edge closes no cycle
- **THEN** the edge is created as before
