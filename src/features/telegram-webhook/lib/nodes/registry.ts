import type { WorkflowNodeType } from '@/entities/workflow';

import type { NodeHandler } from './types';

import { messageHandler } from './message-handler';
import { questionHandler } from './question-handler';
import { choiceHandler } from './choice-handler';
import { conditionHandler } from './condition-handler';
import { endHandler } from './end-handler';
import { summaryHandler } from './summary-handler';

const startHandler: NodeHandler = {
  async handle() {
    return {
      nextNodeId: null,
    };
  },
};

const nodeHandlersMap = {
  start: startHandler,

  message: messageHandler,

  question: questionHandler,

  choice: choiceHandler,

  condition: conditionHandler,

  end: endHandler,

  summary: summaryHandler,
} satisfies Record<WorkflowNodeType, NodeHandler>;

export const nodeHandlersRegistry = nodeHandlersMap;

export function getNodeHandler(nodeType: WorkflowNodeType): NodeHandler | undefined {
  return nodeHandlersMap[nodeType];
}
