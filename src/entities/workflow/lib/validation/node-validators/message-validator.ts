import type { AppNode, MessageAppNode } from '../../../model/types';

import type { NodeDataValidator, ValidationIssue } from '../types';

/**
 * Validates message node data:
 * - Text must not be empty or whitespace-only. Telegram rejects sendMessage
 *   with empty text, and attachments are not delivered by the runtime yet,
 *   so they do not make an empty message valid.
 */
export const messageNodeValidator: NodeDataValidator = (node: AppNode): ValidationIssue[] => {
  const messageNode = node as MessageAppNode;
  const issues: ValidationIssue[] = [];

  if (!messageNode.data.text?.trim()) {
    issues.push({
      severity: 'error',
      code: 'EMPTY_NODE_TEXT',
      nodeId: messageNode.id,
      messageKey: 'validation.emptyNodeText',
    });
  }

  return issues;
};
