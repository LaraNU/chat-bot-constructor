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

interface WorkflowEngineState {
  nodesById: Map<string, AppNode>;
  edgesBySource: Map<string, AppEdge[]>;
  startNodeId: string | null;
}

function createWorkflowEngineState(nodes: AppNode[], edges: AppEdge[]): WorkflowEngineState {
  const nodesById = new Map<string, AppNode>();
  const edgesBySource = new Map<string, AppEdge[]>();
  let startNodeId: string | null = null;

  for (const node of nodes) {
    nodesById.set(node.id, node);

    if (!startNodeId && node.type === 'start') {
      startNodeId = node.id;
    }
  }

  for (const edge of edges) {
    const sourceEdges = edgesBySource.get(edge.source);

    if (sourceEdges) {
      sourceEdges.push(edge);
    } else {
      edgesBySource.set(edge.source, [edge]);
    }
  }

  return {
    nodesById,
    edgesBySource,
    startNodeId,
  };
}

/**
 * Получить следующую ноду из стартовой позиции
 */
function getNextNodeId(currentId: string | null, state: WorkflowEngineState): string | null {
  const startNodeId = currentId ?? state.startNodeId;

  if (!startNodeId) return null;

  const nextEdge = state.edgesBySource.get(startNodeId)?.[0];
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
  const state = createWorkflowEngineState(nodes, edges);

  const isResuming = initialNodeId !== null;

  let currentNodeId = isResuming ? initialNodeId : getNextNodeId(null, state);

  while (currentNodeId) {
    const currentNode = state.nodesById.get(currentNodeId);

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
      nodesById: state.nodesById,
      edgesBySource: state.edgesBySource,
      context,
      tempData,
      initialNodeId,
    });

    if (result.shouldStop) {
      return result.nextNodeId;
    }

    currentNodeId = result.nextNodeId;
  }

  return null;
}
