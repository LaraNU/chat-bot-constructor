import { StartNode } from '@/entities/workflow/ui/nodes/start-node';
import { MessageNode } from '@/entities/workflow/ui/nodes/message-node';
import { ConditionNode } from '@/entities/workflow/ui/nodes/condition-node';
import { EndNode } from '@/entities/workflow/ui/nodes/end-node';
import { NodeTypes } from '@xyflow/react';

export const NODE_TYPES: NodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  end: EndNode,
};
