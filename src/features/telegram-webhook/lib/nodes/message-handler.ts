import type { MessageAppNode } from '@/entities/workflow';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { NodeHandler, NodeHandlerParams, NodeHandlerResult } from './types';

export const messageHandler: NodeHandler = {
  async handle(params: NodeHandlerParams): Promise<NodeHandlerResult> {
    const { node, edgesBySource, context, tempData, initialNodeId } = params;

    const messageNode = node as MessageAppNode;

    /**
     * Если currentNodeId указывает на эту ноду,
     * значит пользователь отвечает именно на неё.
     */
    const isResumingNode = initialNodeId === node.id;

    if (isResumingNode) {
      /**
       * Сохраняем ответ пользователя только для нод,
       * которые ожидают ввод текста.
       */
      if (messageNode.data.shouldSaveResponse) {
        const variableKey = messageNode.data.saveToVariable;

        if (variableKey) {
          tempData.answers ??= {};

          tempData.answers[variableKey] = context.userText;
        }
      }

      const nextEdge = edgesBySource.get(node.id)?.[0];

      return {
        nextNodeId: nextEdge?.target ?? null,
      };
    }

    /**
     * Первое посещение ноды — отправляем сообщение.
     */
    const textToSend = messageNode.data.text || 'Пустое сообщение';

    const buttons = messageNode.data.buttons || [];

    const replyMarkup =
      buttons.length > 0
        ? {
            inline_keyboard: [
              buttons
                .filter((btn) => btn.text && btn.value)
                .map((btn) => ({
                  text: btn.text,
                  callback_data: btn.value,
                })),
            ],
          }
        : undefined;

    await sendTelegramMessage(context.botToken, Number(context.chatId), textToSend, replyMarkup);

    /**
     * Если ждём кнопку или текстовый ответ —
     * останавливаем выполнение и сохраняем текущую ноду.
     */
    if (messageNode.data.shouldSaveResponse || buttons.length > 0) {
      return {
        nextNodeId: node.id,
        shouldStop: true,
      };
    }

    /**
     * Обычное сообщение без ожидания ответа —
     * сразу переходим дальше.
     */
    const nextEdge = edgesBySource.get(node.id)?.[0];

    return {
      nextNodeId: nextEdge?.target ?? null,
    };
  },
};
