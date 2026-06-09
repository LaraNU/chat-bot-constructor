import type { AppNode, AppEdge, WorkflowNodeType } from '@/entities/workflow';
import type { UserContext } from '../model/types';
import { getNodeHandler } from './nodes/registry';
import type { TempData } from './nodes/types';

interface RunEngineParams {
  nodes: AppNode[];
  edges: AppEdge[];
  initialNodeId: string | null;
  context: UserContext;
  tempData?: TempData;
}

/**
 * Получить следующую ноду из стартовой позиции
 */
function getNextNodeId(
  currentId: string | null,
  nodes: AppNode[],
  edges: AppEdge[]
): string | null {
  let startNodeId: string | null = null;

  if (currentId) {
    startNodeId = currentId;
  } else {
    const startNode = nodes.find((n) => n.type === 'start');
    startNodeId = startNode?.id ?? null;
  }

  if (!startNodeId) return null;

  const nextEdge = edges.find((e) => e.source === startNodeId);
  return nextEdge?.target ?? null;
}

/**
 * Основной движок для выполнения workflow'а
 * Использует паттерн Strategy для обработки различных типов нод
 */
export async function runWorkflowEngine({
  nodes,
  edges,
  initialNodeId,
  context,
  tempData = { answers: {} },
}: RunEngineParams): Promise<string | null> {
  let currentNodeId = getNextNodeId(initialNodeId, nodes, edges);

  while (currentNodeId) {
    const currentNode = nodes.find((n) => n.id === currentNodeId);

    if (!currentNode) {
      break;
    }

    const nodeType = currentNode.type as WorkflowNodeType;
    const handler = getNodeHandler(nodeType);

    if (!handler) {
      break;
    }

    const result = await handler.handle({
      node: currentNode,
      edges,
      nodes,
      context,
      tempData,
    });

    if (result.shouldStop) {
      return result.nextNodeId;
    }

    currentNodeId = result.nextNodeId;
  }

  return null;
}
