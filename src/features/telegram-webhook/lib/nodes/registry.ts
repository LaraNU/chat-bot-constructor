import type { WorkflowNodeType } from '@/entities/workflow';
import type { NodeHandler } from './types';
import { messageHandler } from './message-handler';
import { conditionHandler } from './condition-handler';
import { endHandler } from './end-handler';

/**
 * Реестр обработчиков для всех типов нод
 * Сопоставляет тип ноды с соответствующей стратегией обработки
 */
const nodeHandlersMap: Record<WorkflowNodeType, NodeHandler> = {
  message: messageHandler,
  condition: conditionHandler,
  end: endHandler,
  // start-нода не требует обработки (используется только как точка входа)
  start: {
    async handle() {
      return { nextNodeId: null };
    },
  },
};

export const nodeHandlersRegistry = nodeHandlersMap;

/**
 * Получить обработчик для определённого типа ноды
 * @param nodeType тип ноды
 * @returns обработчик для этого типа или undefined если обработчик не найден
 */
export function getNodeHandler(nodeType: WorkflowNodeType): NodeHandler | undefined {
  return nodeHandlersMap[nodeType];
}
