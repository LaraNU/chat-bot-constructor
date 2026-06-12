import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { NodeHandler, NodeHandlerResult } from './types';

import type { QuestionAppNode } from '@/entities/workflow';

export const questionHandler: NodeHandler = {
  async handle(params): Promise<NodeHandlerResult> {
    const { node, context, tempData, initialNodeId, edgesBySource } = params;

    const questionNode = node as QuestionAppNode;

    const isResuming = initialNodeId === node.id;

    if (isResuming) {
      const answer = context.userText ?? '';

      tempData.answers[node.id] = {
        nodeId: node.id,
        text: answer,
      };

      tempData.responses.push({
        question: questionNode.data.answerLabel,
        answer,
      });

      const nextEdge = edgesBySource.get(node.id)?.[0];

      return {
        nextNodeId: nextEdge?.target ?? null,
      };
    }

    const chatId = Number(context.chatId);

    if (isNaN(chatId)) {
      throw new Error(`Invalid chatId: ${context.chatId}`);
    }

    if (!questionNode.data.text) {
      throw new Error(`Question node ${node.id} has no text configured`);
    }

    await sendTelegramMessage(context.botToken, chatId, questionNode.data.text);
    return {
      nextNodeId: node.id,
      shouldStop: true,
    };
  },
};
