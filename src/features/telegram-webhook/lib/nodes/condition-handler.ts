import type { ConditionAppNode } from '@/entities/workflow';
import { NodeHandler, NodeHandlerResult } from './types';

export const conditionHandler: NodeHandler = {
  async handle({ node, tempData, edgesBySource }): Promise<NodeHandlerResult> {
    const conditionNode = node as ConditionAppNode;

    const answer = tempData.answers[conditionNode.data.questionNodeId]?.text ?? '';

    const { operator, value } = conditionNode.data;

    const passed = operator === 'equals' ? answer === value : answer.includes(value);

    const targetEdge = edgesBySource
      .get(node.id)
      ?.find((edge) => edge.sourceHandle === (passed ? 'true' : 'false'));

    return {
      nextNodeId: targetEdge?.target ?? null,
    };
  },
};
