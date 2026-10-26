import { vi, beforeEach, describe, test, expect } from 'vitest';

import type { AppNode, WorkflowNodeType } from '@/entities/workflow';
import { isWaitingNodeType } from '@/entities/workflow/model/node-semantics';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import { prisma } from '@/shared/lib/prisma';
import type { UserContext } from '../../model/types';

import { nodeHandlersRegistry } from './registry';

vi.mock('@/shared/api/telegram/client', () => ({
  sendTelegramMessage: vi.fn(),
}));

vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    botResponse: {
      create: vi.fn(),
    },
  },
}));

const NODE_FIXTURES: Record<WorkflowNodeType, AppNode> = {
  start: { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: {} },
  message: { id: 'message', type: 'message', position: { x: 0, y: 0 }, data: { text: 'Hi' } },
  question: {
    id: 'question',
    type: 'question',
    position: { x: 0, y: 0 },
    data: { text: 'Name?', answerLabel: 'Name' },
  },
  choice: {
    id: 'choice',
    type: 'choice',
    position: { x: 0, y: 0 },
    data: { text: 'Pick', buttons: [{ id: 'btn-a', text: 'A' }] },
  },
  condition: {
    id: 'condition',
    type: 'condition',
    position: { x: 0, y: 0 },
    data: { questionNodeId: 'question', operator: 'equals', value: 'yes' },
  },
  summary: {
    id: 'summary',
    type: 'summary',
    position: { x: 0, y: 0 },
    data: { includedQuestionIds: [], introText: 'Summary' },
  },
  end: { id: 'end', type: 'end', position: { x: 0, y: 0 }, data: { message: 'Bye' } },
};

const mockContext: UserContext = {
  botId: 'bot-1',
  botToken: 'token',
  chatId: '42',
  username: 'user',
};

describe('node semantics ↔ runtime handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendTelegramMessage).mockResolvedValue({});
    vi.mocked(prisma.botResponse.create).mockResolvedValue({} as never);
  });

  const nodeTypes = Object.keys(nodeHandlersRegistry) as WorkflowNodeType[];

  test.each(nodeTypes)(
    '`%s`: waitsForInput matches whether the handler stops on first entry',
    async (type) => {
      const node = NODE_FIXTURES[type];

      const result = await nodeHandlersRegistry[type].handle({
        node,
        nodes: [node],
        edges: [],
        nodesById: new Map([[node.id, node]]),
        edgesBySource: new Map(),
        context: mockContext,
        tempData: { answers: {}, responses: [] },
        initialNodeId: null,
      });

      expect(Boolean(result.shouldStop)).toBe(isWaitingNodeType(type));
    }
  );
});
