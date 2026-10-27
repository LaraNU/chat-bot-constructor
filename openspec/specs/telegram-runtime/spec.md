# telegram-runtime Specification

## Purpose

Defines the execution guarantees of the Telegram runtime when it runs a published workflow in response to a single Telegram update, so that a malformed graph can never make a bot send messages without bound.

## Requirements

### Requirement: Execution stops on a cycle without a waiting node

While processing a single Telegram update, the runtime SHALL execute each node that does not wait for user input (every node type other than `question` and `choice`) at most once. If such a node is reached a second time within the same update, the runtime SHALL stop executing the workflow before running that node again and SHALL report the failure as a distinguishable execution-limit error that identifies the bot and the node at which execution stopped. Reaching a waiting node (`question`, `choice`) again within the same update SHALL NOT be treated as a cycle, because that node stops execution and waits for input.

#### Scenario: Message-only cycle is cut after one pass

- **WHEN** a published workflow contains `start → message A → message B → message A` and an end user sends `/start`
- **THEN** the end user receives message A and message B exactly once each, and execution stops with an execution-limit error identifying message A

#### Scenario: Cycle through a condition is cut

- **WHEN** a published workflow routes `message A → condition C → message A` (on the branch that matches the stored answer)
- **THEN** message A is sent at most once for that update and execution stops with an execution-limit error

#### Scenario: Loop through a question node is allowed

- **WHEN** a workflow contains `question Q → condition C → (false branch) → message "Try again" → question Q`, the session is waiting on Q, and the end user sends an answer that fails the condition
- **THEN** the end user receives "Try again" and question Q again, execution stops normally waiting for input on Q, and no execution-limit error is reported

#### Scenario: Resuming a waiting node is not a cycle

- **WHEN** the session is waiting on question Q and the end user's answer leads through other nodes back to Q within the same update
- **THEN** Q sends its question again and execution stops normally waiting for input

### Requirement: Execution is bounded by a per-update step limit

The runtime SHALL execute at most a fixed maximum number of nodes while processing a single Telegram update, independent of cycle detection. When the limit is reached, the runtime SHALL stop executing the workflow and SHALL report a distinguishable execution-limit error. The limit SHALL be high enough that any acyclic workflow a user can reasonably build executes to completion.

#### Scenario: Step limit stops an over-long execution

- **WHEN** processing one update would require executing more nodes than the per-update step limit
- **THEN** execution stops once the limit is reached and an execution-limit error is reported

#### Scenario: Normal linear workflow is unaffected

- **WHEN** a published workflow `start → message → question` (fewer nodes than the limit) is executed
- **THEN** all nodes run as before and no execution-limit error is reported
