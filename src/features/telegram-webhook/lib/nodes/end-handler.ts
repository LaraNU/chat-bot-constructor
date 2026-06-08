import type { EndAppNode } from '@/entities/workflow';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { NodeHandler, NodeHandlerParams, NodeHandlerResult } from './types';

/**
 * Обработчик для end-ноды.
 * Отправляет финальное сообщение и завершает workflow.
 */
export const endHandler: NodeHandler = {
  async handle(params: NodeHandlerParams): Promise<NodeHandlerResult> {
    const { node, context } = params;
    const endNode = node as EndAppNode;

    const endText = endNode.data.message || 'Диалог завершен';
    await sendTelegramMessage(context.botToken, Number(context.chatId), endText);

    // Возвращаем null в качестве nextNodeId, указывая на завершение workflow
    return {
      nextNodeId: null,
    };
  },
};
