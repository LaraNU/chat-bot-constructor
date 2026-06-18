import type { SummaryAppNode, QuestionAppNode } from '@/entities/workflow';

import { sendTelegramMessage } from '@/shared/api/telegram/client';

import type { NodeHandler, NodeHandlerParams, NodeHandlerResult } from './types';

import { getQuestionLabel } from '@/entities/workflow/lib/get-question-label';

export const summaryHandler: NodeHandler = {
  async handle(params: NodeHandlerParams): Promise<NodeHandlerResult> {
    const { node, nodesById, edgesBySource, context, tempData } = params;

    const summaryNode = node as SummaryAppNode;

    const intro = summaryNode.data.introText ?? '';

    let summaryText = '';

    if (summaryNode.data.customTemplate?.trim()) {
      summaryText = summaryNode.data.customTemplate;

      for (const questionId of summaryNode.data.includedQuestionIds ?? []) {
        const question = nodesById.get(questionId);

        if (!question || question.type !== 'question') {
          continue;
        }

        const answer = tempData.answers[questionId];

        const label = getQuestionLabel(question as QuestionAppNode);

        summaryText = summaryText.replaceAll(`{{${label}}}`, answer?.text ?? '');
      }
    } else {
      summaryText = summaryNode.data.includedQuestionIds
        .map((questionId) => {
          const question = nodesById.get(questionId);

          if (!question || question.type !== 'question') {
            return null;
          }

          const answer = tempData.answers[questionId];

          return `${getQuestionLabel(question as QuestionAppNode)}: ${answer?.text ?? ''}`;
        })
        .filter(Boolean)
        .join('\n');
    }

    const finalText = [intro, summaryText].filter(Boolean).join('\n\n');

    if (finalText.trim()) {
      await sendTelegramMessage(context.botToken, Number(context.chatId), finalText);
    }

    const nextEdge = edgesBySource.get(node.id)?.[0];

    return {
      nextNodeId: nextEdge?.target ?? null,
    };
  },
};
