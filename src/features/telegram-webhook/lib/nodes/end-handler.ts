import type { EndAppNode } from '@/entities/workflow';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { NodeHandler, NodeHandlerParams, NodeHandlerResult } from './types';

export const endHandler: NodeHandler = {
  async handle(params: NodeHandlerParams): Promise<NodeHandlerResult> {
    const { node, context, tempData } = params;

    const endNode = node as EndAppNode;

    const finalAnswers = tempData.responses ?? [];

    if (finalAnswers.length > 0) {
      const serializedAnswers = JSON.parse(JSON.stringify(finalAnswers)) as Prisma.InputJsonValue;

      await prisma.botResponse.create({
        data: {
          botId: context.botId,
          telegramChatId: context.chatId,
          answers: serializedAnswers,
        },
      });
    }

    tempData.responses = [];

    const endText = endNode.data.message || 'Dialog ended. Thank you!';

    const chatId = Number(context.chatId);
    if (isNaN(chatId)) {
      throw new Error(`Invalid chatId: ${context.chatId}`);
    }
    await sendTelegramMessage(context.botToken, chatId, endText);
    return {
      nextNodeId: null,
    };
  },
};
