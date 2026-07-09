import type { AppNode, SummaryAppNode } from '../../../model/types';

import type { NodeDataValidator, ValidationIssue } from '../types';

/**
 * Validates summary node data:
 * - At least one question should be included (warning: summary will be empty).
 * - All ids in includedQuestionIds must still exist in the graph (warning: stale refs).
 */
export const summaryNodeValidator: NodeDataValidator = (
  node: AppNode,
  nodes: AppNode[]
): ValidationIssue[] => {
  const summaryNode = node as SummaryAppNode;
  const issues: ValidationIssue[] = [];

  const included = summaryNode.data.includedQuestionIds ?? [];

  if (included.length === 0) {
    issues.push({
      severity: 'warning',
      code: 'SUMMARY_NO_INCLUDED_QUESTIONS',
      nodeId: summaryNode.id,
      messageKey: 'validation.summaryNoIncludedQuestions',
    });
    return issues;
  }

  const nodeIds = new Set(nodes.map((n) => n.id));

  const staleIds = included.filter((id) => !nodeIds.has(id));

  if (staleIds.length > 0) {
    issues.push({
      severity: 'warning',
      code: 'SUMMARY_INVALID_QUESTION_REFS',
      nodeId: summaryNode.id,
      messageKey: 'validation.summaryInvalidQuestionRefs',
      messageParams: { count: String(staleIds.length) },
    });
  }

  return issues;
};
