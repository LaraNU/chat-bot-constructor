import type { AppEdge, AppNode, ChoiceAppNode, ConditionAppNode } from '../../model/types';

import type { ValidationIssue } from './types';

function buildEdgesBySource(edges: AppEdge[]): Map<string, AppEdge[]> {
  const map = new Map<string, AppEdge[]>();

  for (const edge of edges) {
    const existing = map.get(edge.source) ?? [];
    existing.push(edge);
    map.set(edge.source, existing);
  }

  return map;
}

/**
 * Validates that each node type has the required outgoing edges.
 *
 * - condition nodes must have both a 'true' and a 'false' edge.
 * - choice nodes must have a corresponding edge for every configured button.
 *
 * These checks catch missing connections that would cause the runtime engine
 * to silently dead-end on a null nextNodeId.
 */
export function validateNodeConnections(nodes: AppNode[], edges: AppEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const edgesBySource = buildEdgesBySource(edges);

  for (const node of nodes) {
    if (node.type === 'condition') {
      const conditionNode = node as ConditionAppNode;
      const outgoing = edgesBySource.get(conditionNode.id) ?? [];

      const hasTrueBranch = outgoing.some((e) => e.sourceHandle === 'true');
      const hasFalseBranch = outgoing.some((e) => e.sourceHandle === 'false');

      if (!hasTrueBranch) {
        issues.push({
          severity: 'error',
          code: 'CONDITION_MISSING_TRUE_BRANCH',
          nodeId: conditionNode.id,
          messageKey: 'validation.conditionMissingTrueBranch',
        });
      }

      if (!hasFalseBranch) {
        issues.push({
          severity: 'error',
          code: 'CONDITION_MISSING_FALSE_BRANCH',
          nodeId: conditionNode.id,
          messageKey: 'validation.conditionMissingFalseBranch',
        });
      }
    }

    if (node.type === 'choice') {
      const choiceNode = node as ChoiceAppNode;
      const outgoing = edgesBySource.get(choiceNode.id) ?? [];
      const outgoingHandles = new Set(outgoing.map((e) => e.sourceHandle));

      for (const button of choiceNode.data.buttons ?? []) {
        if (!outgoingHandles.has(button.id)) {
          issues.push({
            severity: 'error',
            code: 'CHOICE_BUTTON_NO_EDGE',
            nodeId: choiceNode.id,
            messageKey: 'validation.choiceButtonNoEdge',
            messageParams: { buttonText: button.text, buttonId: button.id },
          });
        }
      }
    }
  }

  return issues;
}
