import type { MessageAppNode } from '@/entities/workflow';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { NodeHandler, NodeHandlerResult } from './types';

export const messageHandler: NodeHandler = {
  async handle({ node, edgesBySource, context }): Promise<NodeHandlerResult> {
    const messageNode = node as MessageAppNode;

    const chatId = Number(context.chatId);

    if (isNaN(chatId)) {
      throw new Error(`Invalid chatId: ${context.chatId}`);
    }

    await sendTelegramMessage(context.botToken, chatId, messageNode.data.text || '');
    const nextEdge = edgesBySource.get(node.id)?.[0];

    return {
      nextNodeId: nextEdge?.target ?? null,
    };
  },
};
