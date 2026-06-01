import { StartNode } from './start-node';
import { MessageNode } from './message-node';
import { ConditionNode } from './condition-node';
import { EndNode } from './end-node';
import { NodeTypes } from '@xyflow/react';

export const NODE_TYPES: NodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  end: EndNode,
};
