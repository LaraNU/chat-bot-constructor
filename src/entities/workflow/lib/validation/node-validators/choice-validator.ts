import type { AppNode, ChoiceAppNode } from '../../../model/types';

import type { NodeDataValidator, ValidationIssue } from '../types';

/**
 * Validates choice node data:
 * - Must have at least one button configured.
 *   An empty buttons array means the Telegram runtime would throw immediately.
 */
export const choiceNodeValidator: NodeDataValidator = (node: AppNode): ValidationIssue[] => {
  const choiceNode = node as ChoiceAppNode;
  const issues: ValidationIssue[] = [];

  if (!choiceNode.data.buttons || choiceNode.data.buttons.length === 0) {
    issues.push({
      severity: 'error',
      code: 'CHOICE_NO_BUTTONS',
      nodeId: choiceNode.id,
      messageKey: 'validation.choiceNoButtons',
    });
  }

  return issues;
};
