import type { AppEdge, AppNode, ChoiceAppNode, ConditionAppNode } from '../../model/types';
import { WORKFLOW_NODE_SEMANTICS } from '../../model/node-semantics';
import { groupEdgesByOutput } from '../graph';

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
 * Validates outgoing edges of each node against its type.
 *
 * - condition nodes must have both a 'true' and a 'false' edge.
 * - choice nodes must have a corresponding edge for every configured button.
 * - every node output may have at most one edge (error): the runtime follows
 *   only the first one, so extra edges would be silently dead branches.
 * - single-output nodes other than start should have an outgoing edge
 *   (warning): otherwise the dialog ends without reaching an end node.
 *   A missing start edge is reported by validateGraphStructure.
 *
 * These checks catch connections the runtime engine cannot execute as drawn.
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

    const { outputs } = WORKFLOW_NODE_SEMANTICS[node.type];

    if (outputs === 'single' && node.type !== 'start' && !edgesBySource.has(node.id)) {
      issues.push({
        severity: 'warning',
        code: 'NODE_HAS_NO_OUTGOING_EDGE',
        nodeId: node.id,
        messageKey: 'validation.nodeHasNoOutgoingEdge',
      });
    }
  }

  for (const output of groupEdgesByOutput(edges)) {
    if (output.edges.length > 1) {
      issues.push({
        severity: 'error',
        code: 'MULTIPLE_EDGES_FROM_OUTPUT',
        nodeId: output.source,
        messageKey: 'validation.multipleEdgesFromOutput',
        messageParams: {
          handleId: output.sourceHandle ?? '',
          count: String(output.edges.length),
        },
      });
    }
  }

  return issues;
}
