import { vi, beforeEach, describe, test, expect } from 'vitest';

import { questionHandler } from './question-handler';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { QuestionAppNode } from '@/entities/workflow';
import type { UserContext } from '../../model/types';
import type { NodeHandlerParams, TempData } from './types';

vi.mock('@/shared/api/telegram/client', () => ({
  sendTelegramMessage: vi.fn(),
}));

describe('questionHandler', () => {
  const mockContext: UserContext = {
    botId: 'bot-1',
    botToken: 'token-123',
    chatId: '42',
    username: 'user',
  };

  function buildNode(overrides: Partial<QuestionAppNode['data']> = {}): QuestionAppNode {
    return {
      id: 'question-1',
      type: 'question',
      position: { x: 0, y: 0 },
      data: { text: 'What is your name?', answerLabel: 'Name', ...overrides },
    };
  }

  function buildParams(overrides: Partial<NodeHandlerParams> = {}): NodeHandlerParams {
    const node = buildNode();

    return {
      node,
      nodes: [node],
      edges: [],
      nodesById: new Map([[node.id, node]]),
      edgesBySource: new Map(),
      context: mockContext,
      tempData: { answers: {}, responses: [] },
      initialNodeId: null,
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendTelegramMessage).mockResolvedValue({});
  });

  describe('first visit (not resuming)', () => {
    test('should send the question text and stop, waiting for the user reply', async () => {
      const node = buildNode();

      const result = await questionHandler.handle(
        buildParams({ node, nodesById: new Map([[node.id, node]]) })
      );

      expect(sendTelegramMessage).toHaveBeenCalledWith(mockContext.botToken, 42, node.data.text);
      expect(result).toEqual({ nextNodeId: node.id, shouldStop: true });
    });

    test('should throw when the node has no text configured', async () => {
      const node = buildNode({ text: '' });

      await expect(
        questionHandler.handle(buildParams({ node, nodesById: new Map([[node.id, node]]) }))
      ).rejects.toThrow(`Question node ${node.id} has no text configured`);

      expect(sendTelegramMessage).not.toHaveBeenCalled();
    });

    test('should throw when chatId is not a valid number', async () => {
      await expect(
        questionHandler.handle(buildParams({ context: { ...mockContext, chatId: 'nan' } }))
      ).rejects.toThrow('Invalid chatId: nan');
    });
  });

  describe('resuming with the user answer', () => {
    test('should save the answer to tempData and follow the outgoing edge', async () => {
      const node = buildNode();
      const edgesBySource = new Map([
        [node.id, [{ id: 'e1', source: node.id, target: 'next-node' }]],
      ]);

      const tempData: TempData = { answers: {}, responses: [] };

      const result = await questionHandler.handle(
        buildParams({
          node,
          nodesById: new Map([[node.id, node]]),
          edgesBySource,
          initialNodeId: node.id,
          context: { ...mockContext, userText: 'Alice' },
          tempData,
        })
      );

      expect(tempData.answers[node.id]).toEqual({ nodeId: node.id, text: 'Alice' });
      expect(tempData.responses).toEqual([{ question: 'Name', answer: 'Alice' }]);
      expect(result).toEqual({ nextNodeId: 'next-node' });
      expect(sendTelegramMessage).not.toHaveBeenCalled();
    });

    test('should save an empty answer when userText is not provided', async () => {
      const node = buildNode();
      const tempData: TempData = { answers: {}, responses: [] };

      await questionHandler.handle(
        buildParams({
          node,
          nodesById: new Map([[node.id, node]]),
          initialNodeId: node.id,
          tempData,
        })
      );

      expect(tempData.answers[node.id]).toEqual({ nodeId: node.id, text: '' });
    });
  });
});
