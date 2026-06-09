import type { EndAppNode } from '@/entities/workflow';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { NodeHandler, NodeHandlerParams, NodeHandlerResult } from './types';

export const endHandler: NodeHandler = {
  async handle(params: NodeHandlerParams): Promise<NodeHandlerResult> {
    const { node, context, tempData } = params;

    const endNode = node as EndAppNode;

    const finalAnswers = tempData.answers ?? {};

    if (Object.keys(finalAnswers).length > 0) {
      const serializedAnswers = JSON.parse(JSON.stringify(finalAnswers)) as Prisma.InputJsonValue;

      await prisma.botResponse.create({
        data: {
          botId: context.botId,
          telegramChatId: context.chatId,
          answers: serializedAnswers,
        },
      });
    }

    tempData.answers = {};

    const endText = endNode.data.message || 'Диалог завершен';

    await sendTelegramMessage(context.botToken, Number(context.chatId), endText);

    return {
      nextNodeId: null,
    };
  },
};
