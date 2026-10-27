## ADDED Requirements

### Requirement: Canvas rejects a second edge from the same node output

While the user drags a new connection on the canvas, the editor SHALL treat the connection as invalid, and SHALL NOT create the edge on release, when the source output already has an outgoing edge. A node output is the single output of a `start`, `message`, `question` or `summary` node, each button of a `choice` node, or each of the `true` and `false` branches of a `condition` node. Connections from an output that has no edge yet SHALL remain allowed, subject to the other connection rules.

#### Scenario: Second edge from a message is rejected

- **WHEN** the canvas contains `message A → message B` and the user drags a connection from A to `message C`
- **THEN** the connection is shown as invalid and no edge is created when the user releases it

#### Scenario: Second edge from the same choice button is rejected

- **WHEN** a `choice` button already has an edge and the user drags another connection from the same button
- **THEN** the connection is shown as invalid and no edge is created

#### Scenario: Different outputs of a branching node are allowed

- **WHEN** a `condition` node has a `true` edge and the user drags a connection from its `false` branch
- **THEN** the edge is created

#### Scenario: Output becomes available after its edge is deleted

- **WHEN** the user deletes the only edge leaving `message A` and then drags a connection from A to another node
- **THEN** the edge is created
