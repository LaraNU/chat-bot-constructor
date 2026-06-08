import type { MessageAppNode } from '@/entities/workflow';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { NodeHandler, NodeHandlerParams, NodeHandlerResult } from './types';

/**
 * Проверить, есть ли у ноды флаг сохранения ответа
 */
function hasSaveToVariableFlag(node: MessageAppNode): boolean {
  // Проверяем наличие свойства saveToVariable в data ноды
  const nodeData = node.data as Record<string, unknown>;
  return (
    typeof nodeData.label === 'string' && nodeData.label !== '' && nodeData.saveToVariable === true
  );
}

/**
 * Обработчик для message-ноды.
 * Отправляет сообщение пользователю и определяет следующую ноду.
 * Если у ноды есть свойство saveToVariable, сохраняет ответ в tempData.answers.
 */
export const messageHandler: NodeHandler = {
  async handle(params: NodeHandlerParams): Promise<NodeHandlerResult> {
    const { node, edges, nodes, context, tempData } = params;
    const messageNode = node as MessageAppNode;

    // Отправляем сообщение
    const textToSend = messageNode.data.text || 'Пустое сообщение';
    await sendTelegramMessage(context.botToken, Number(context.chatId), textToSend);

    // Если у ноды есть флаг сохранения, сохраняем ответ
    if (hasSaveToVariableFlag(messageNode)) {
      const label = messageNode.data.label ?? '';
      tempData.answers[label] = context.userText;
    }

    // Ищем следующую ноду
    const nextEdge = edges.find((e) => e.source === node.id);
    const nextNode = nextEdge ? nodes.find((n) => n.id === nextEdge.target) : undefined;

    // Проверяем, является ли следующая нода condition-нодой с переменной message_text
    const isNextNodeConditionOnText =
      nextNode?.type === 'condition' &&
      (nextNode.data as Record<string, unknown>).variable === 'message_text';

    // Если нет следующей ноды, или это message-нода, или это condition-нода по текету,
    // то остаёмся на текущей ноде (точка остановки - ждём ответа)
    if (!nextNode || nextNode.type === 'message' || isNextNodeConditionOnText) {
      return {
        nextNodeId: node.id,
        shouldStop: true,
      };
    }

    // Переходим к следующей ноде
    return {
      nextNodeId: nextNode.id,
    };
  },
};
