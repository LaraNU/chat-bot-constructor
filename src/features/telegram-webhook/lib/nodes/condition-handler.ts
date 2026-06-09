import type { ConditionAppNode } from '@/entities/workflow';
import type { NodeHandler, NodeHandlerParams, NodeHandlerResult } from './types';

/**
 * Вспомогательная функция для сравнения значений
 */
function compareValues(valueToCheck: string, value: string, operator: string): boolean {
  switch (operator) {
    case 'equals':
      return valueToCheck.toLowerCase() === value.toLowerCase();
    case 'contains':
      return valueToCheck.toLowerCase().includes(value.toLowerCase());
    case 'exists':
      return valueToCheck.trim() !== '';
    case 'lessThan':
    case 'greaterThan': {
      const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      const compareResult = collator.compare(valueToCheck, value);
      if (operator === 'lessThan') return compareResult < 0;
      if (operator === 'greaterThan') return compareResult > 0;
      return false;
    }
    default:
      return false;
  }
}

/**
 * Обработчик для condition-ноды.
 * Проверяет условие и переходит к соответствующей ветви (true или false).
 */
export const conditionHandler: NodeHandler = {
  async handle(params: NodeHandlerParams): Promise<NodeHandlerResult> {
    const { node, edges, nodes, context, tempData } = params;
    const conditionNode = node as ConditionAppNode;
    const { variable, operator, value } = conditionNode.data;

    let valueToCheck = '';

    if (variable === 'message_text' || variable === 'callback_data') {
      valueToCheck = context.userText;
    } else if (variable === 'username') {
      valueToCheck = context.username;
    } else {
      const savedAnswers = (tempData.answers as Record<string, unknown>) || {};
      const answerValue = savedAnswers[variable];

      valueToCheck = answerValue != null ? String(answerValue) : '';
    }

    const isTrue = compareValues(valueToCheck, value, operator);

    const targetHandle = isTrue ? 'true' : 'false';
    const conditionEdge = edges.find(
      (e) => e.source === node.id && e.sourceHandle === targetHandle
    );

    const nextNode = conditionEdge ? nodes.find((n) => n.id === conditionEdge.target) : undefined;

    return {
      nextNodeId: nextNode?.id ?? null,
    };
  },
};
