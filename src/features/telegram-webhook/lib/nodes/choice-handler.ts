import type { ChoiceAppNode } from '@/entities/workflow';
import { NodeHandler, NodeHandlerResult } from './types';
import { sendTelegramMessage } from '@/shared/api/telegram/client';

export const choiceHandler: NodeHandler = {
  async handle(params): Promise<NodeHandlerResult> {
    const { node, context, tempData, initialNodeId, edgesBySource } = params;

    const choiceNode = node as ChoiceAppNode;

    const isResuming = initialNodeId === node.id;

    if (isResuming) {
      const buttonId = context.callbackData;

      if (!buttonId) {
        throw new Error(`Missing callback data for choice node ${node.id}`);
      }

      const isValidButton = choiceNode.data.buttons.some((btn) => btn.id === buttonId);

      if (!isValidButton) {
        throw new Error(`Invalid button ID "${buttonId}" for choice node ${node.id}`);
      }

      tempData.answers[node.id] = {
        nodeId: node.id,
        buttonId,
      };

      const targetEdge = edgesBySource.get(node.id)?.find((edge) => edge.sourceHandle === buttonId);

      return {
        nextNodeId: targetEdge?.target ?? null,
      };
    }

    if (!choiceNode.data.buttons || choiceNode.data.buttons.length === 0) {
      throw new Error(`Choice node ${node.id} has no buttons configured`);
    }

    const chatId = Number(context.chatId);

    if (isNaN(chatId)) {
      throw new Error(`Invalid chatId: ${context.chatId}`);
    }

    await sendTelegramMessage(context.botToken, chatId, choiceNode.data.text, {
      inline_keyboard: [
        choiceNode.data.buttons.map((button) => ({
          text: button.text,
          callback_data: button.id,
        })),
      ],
    });

    return {
      nextNodeId: node.id,
      shouldStop: true,
    };
  },
};
