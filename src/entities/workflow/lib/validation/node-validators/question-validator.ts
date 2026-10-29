import type { AppNode, QuestionAppNode } from '../../../model/types';

import type { NodeDataValidator, ValidationIssue } from '../types';

/**
 * Validates question node data:
 * - Text must not be empty or whitespace-only. The runtime handler throws
 *   when asked to send a question without text.
 */
export const questionNodeValidator: NodeDataValidator = (node: AppNode): ValidationIssue[] => {
  const questionNode = node as QuestionAppNode;
  const issues: ValidationIssue[] = [];

  if (!questionNode.data.text?.trim()) {
    issues.push({
      severity: 'error',
      code: 'EMPTY_NODE_TEXT',
      nodeId: questionNode.id,
      messageKey: 'validation.emptyNodeText',
    });
  }

  return issues;
};
