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
      return !!valueToCheck;

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
 * Получить значение из tempData с безопасным приведением типов
 */
function getTempDataValue(tempData: Record<string, unknown>, key: string): string {
  const value = tempData[key];
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
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

    // Получаем значение переменной для проверки
    if (variable === 'message_text') {
      valueToCheck = context.userText;
    } else if (variable === 'username') {
      valueToCheck = context.username;
    } else if (variable === 'callback_data') {
      // callback_data может быть получена из tempData если потребуется
      valueToCheck = getTempDataValue(tempData, 'callback_data');
    }

    // Проверяем условие
    const isTrue = compareValues(valueToCheck, value, operator);

    // Определяем, какое ребро использовать (true или false)
    const targetHandle = isTrue ? 'true' : 'false';
    const conditionEdge = edges.find(
      (e) => e.source === node.id && e.sourceHandle === targetHandle
    );

    // Ищем целевую ноду
    const nextNode = conditionEdge ? nodes.find((n) => n.id === conditionEdge.target) : undefined;

    return {
      nextNodeId: nextNode?.id ?? null,
    };
  },
};
