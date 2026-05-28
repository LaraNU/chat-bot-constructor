import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { AppNode, AppEdge } from '@/entities/workflow';
import { isMessageNode, isConditionNode, isEndNode } from '../model/guards';
import type { UserContext } from '../model/types';

interface RunEngineParams {
  nodes: AppNode[];
  edges: AppEdge[];
  initialNodeId: string | null;
  context: UserContext;
}

export async function runWorkflowEngine({
  nodes,
  edges,
  initialNodeId,
  context,
}: RunEngineParams): Promise<string | null> {
  const { botToken, chatId, userText, username } = context;
  let currentId = initialNodeId;
  let activeNode: AppNode | undefined = undefined;

  if (!currentId) {
    const startNode = nodes.find((n) => n.type === 'start');
    if (startNode) {
      const nextEdge = edges.find((e) => e.source === startNode.id);
      activeNode = nextEdge ? nodes.find((n) => n.id === nextEdge.target) : undefined;
    }
  } else {
    const nextEdge = edges.find((e) => e.source === currentId);
    activeNode = nextEdge ? nodes.find((n) => n.id === nextEdge.target) : undefined;
  }

  currentId = activeNode?.id ?? null;

  while (activeNode) {
    const node = activeNode;

    if (isMessageNode(node)) {
      const textToSend = node.data.text || 'Пустое сообщение';
      await sendTelegramMessage(botToken, Number(chatId), textToSend);

      const nextEdge = edges.find((e) => e.source === node.id);
      const nextNode = nextEdge ? nodes.find((n) => n.id === nextEdge.target) : undefined;
      const isNextNodeConditionOnText =
        nextNode?.type === 'condition' &&
        (nextNode.data as Record<string, unknown>).variable === 'message_text';

      if (!nextNode || nextNode.type === 'message' || isNextNodeConditionOnText) {
        currentId = node.id;
        break;
      }

      activeNode = nextNode;
      currentId = activeNode.id;
      continue;
    }

    if (isConditionNode(node)) {
      const { variable, operator, value } = node.data;
      let isTrue = false;
      let valueToCheck = '';

      if (variable === 'message_text') valueToCheck = userText;
      if (variable === 'username') valueToCheck = username;

      if (operator === 'equals') isTrue = valueToCheck.toLowerCase() === value.toLowerCase();
      if (operator === 'contains')
        isTrue = valueToCheck.toLowerCase().includes(value.toLowerCase());
      if (operator === 'lessThan') isTrue = valueToCheck.localeCompare(value) < 0;
      if (operator === 'greaterThan') isTrue = valueToCheck.localeCompare(value) > 0;
      if (operator === 'exists') isTrue = !!valueToCheck;

      const targetHandle = isTrue ? 'true' : 'false';
      const conditionEdge = edges.find(
        (e) => e.source === node.id && e.sourceHandle === targetHandle
      );

      activeNode = conditionEdge ? nodes.find((n) => n.id === conditionEdge.target) : undefined;
      currentId = activeNode?.id ?? null;
      continue;
    }

    if (isEndNode(node)) {
      const endText = node.data.message || 'Диалог завершен';
      await sendTelegramMessage(botToken, Number(chatId), endText);
      currentId = null;
      break;
    }

    break;
  }

  return currentId;
}
