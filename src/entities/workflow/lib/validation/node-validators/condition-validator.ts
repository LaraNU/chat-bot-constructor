import type { AppNode, ConditionAppNode } from '../../../model/types';

import type { NodeDataValidator, ValidationIssue } from '../types';

/**
 * Validates condition node data:
 * - The referenced questionNodeId must exist in the graph and be a question node.
 */
export const conditionNodeValidator: NodeDataValidator = (
  node: AppNode,
  nodes: AppNode[]
): ValidationIssue[] => {
  const conditionNode = node as ConditionAppNode;
  const issues: ValidationIssue[] = [];

  const { questionNodeId } = conditionNode.data;

  if (!questionNodeId) {
    issues.push({
      severity: 'error',
      code: 'CONDITION_INVALID_QUESTION_REF',
      nodeId: conditionNode.id,
      messageKey: 'validation.conditionInvalidQuestionRef',
    });
    return issues;
  }

  const referencedNode = nodes.find((n) => n.id === questionNodeId);

  if (!referencedNode || referencedNode.type !== 'question') {
    issues.push({
      severity: 'error',
      code: 'CONDITION_INVALID_QUESTION_REF',
      nodeId: conditionNode.id,
      messageKey: 'validation.conditionInvalidQuestionRef',
    });
  }

  return issues;
};
