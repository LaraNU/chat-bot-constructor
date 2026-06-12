import { StartNode } from './start-node';
import { MessageNode } from './message-node';
import { ChoiceNode } from './choice-node';
import { ConditionNode } from './condition-node';
import { QuestionNode } from './question-node';
import { EndNode } from './end-node';
import { NodeTypes } from '@xyflow/react';

export const NODE_TYPES: NodeTypes = {
  start: StartNode,
  message: MessageNode,
  question: QuestionNode,
  choice: ChoiceNode,
  condition: ConditionNode,
  end: EndNode,
};
