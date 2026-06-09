import type { MessageAppNode } from '@/entities/workflow';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { NodeHandler, NodeHandlerParams, NodeHandlerResult } from './types';

function hasSaveToVariableField(node: MessageAppNode): boolean {
  return typeof node.data.saveToVariable === 'string' && node.data.saveToVariable.trim() !== '';
}

export const messageHandler: NodeHandler = {
  async handle(params: NodeHandlerParams): Promise<NodeHandlerResult> {
    const { node, edgesBySource, nodesById, context, tempData } = params;
    const messageNode = node as MessageAppNode;

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

    if (hasSaveToVariableField(messageNode)) {
      const variableKey = messageNode.data.saveToVariable ?? '';
      if (variableKey) {
        if (!tempData.answers) tempData.answers = {};
        tempData.answers[variableKey] = context.userText;
      }
    }

    const nextEdge = edgesBySource.get(node.id)?.[0];
    const nextNode = nextEdge ? nodesById.get(nextEdge.target) : undefined;

    const shouldPause =
      !nextNode ||
      nextNode.type === 'message' ||
      nextNode.type === 'condition' ||
      buttons.length > 0;

    if (shouldPause) {
      return {
        nextNodeId: node.id,
        shouldStop: true,
      };
    }

    return {
      nextNodeId: nextNode.id,
    };
  },
};
