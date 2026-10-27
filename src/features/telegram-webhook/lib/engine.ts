import type { AppNode, AppEdge, WorkflowNodeType } from '@/entities/workflow';
// Deep import: the entity's public barrel also re-exports server/UI modules
// that must not be pulled into the runtime engine.
import { isWaitingNodeType } from '@/entities/workflow/model/node-semantics';

import type { UserContext } from '../model/types';

import { WorkflowExecutionLimitError } from './execution-limit-error';
import { getNodeHandler } from './nodes/registry';

import type { TempData } from './nodes/types';

/**
 * Hard cap on node executions per Telegram update. A backstop on top of the
 * cycle check: an acyclic pass is already bounded by the node count.
 */
export const MAX_STEPS_PER_UPDATE = 100;

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
 * Get next node from either currentId or the start node
 */
function getNextNodeId(currentId: string | null, state: WorkflowEngineState): string | null {
  const startNodeId = currentId ?? state.startNodeId;

  if (!startNodeId) {
    return null;
  }

  const nextEdge = state.edgesBySource.get(startNodeId)?.[0];

  return nextEdge?.target ?? null;
}

/**
 * Основной движок выполнения workflow
 */
export async function runWorkflowEngine({
  nodes,
  edges,
  initialNodeId,
  context,
  tempData = {
    answers: {},
    responses: [],
  },
}: RunEngineParams): Promise<string | null> {
  const state = createWorkflowEngineState(nodes, edges);

  const isResuming = initialNodeId !== null;

  let currentNodeId = isResuming ? initialNodeId : getNextNodeId(null, state);

  // Only the first executed handler may treat the update as a resume. A later
  // visit to the same waiting node must ask again, not re-consume the answer.
  let resumeNodeId = initialNodeId;

  const executedNonWaitingNodeIds = new Set<string>();
  let stepCount = 0;

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

    if (stepCount >= MAX_STEPS_PER_UPDATE) {
      throw new WorkflowExecutionLimitError('step_limit', context.botId, currentNode.id);
    }

    if (!isWaitingNodeType(nodeType)) {
      if (executedNonWaitingNodeIds.has(currentNode.id)) {
        throw new WorkflowExecutionLimitError('cycle', context.botId, currentNode.id);
      }

      executedNonWaitingNodeIds.add(currentNode.id);
    }

    stepCount++;

    const result = await handler.handle({
      node: currentNode,
      edges,
      nodes,
      nodesById: state.nodesById,
      edgesBySource: state.edgesBySource,
      context,
      tempData,
      initialNodeId: resumeNodeId,
    });

    resumeNodeId = null;

    if (result.shouldStop) {
      return result.nextNodeId;
    }

    currentNodeId = result.nextNodeId;
  }

  return null;
}
