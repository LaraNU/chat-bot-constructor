import { vi, beforeEach, describe, test, expect } from 'vitest';

import { endHandler } from './end-handler';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import { prisma } from '@/shared/lib/prisma';
import type { EndAppNode } from '@/entities/workflow';
import type { UserContext } from '../../model/types';
import type { NodeHandlerParams, TempData } from './types';

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

describe('endHandler', () => {
  const mockContext: UserContext = {
    botId: 'bot-1',
    botToken: 'token-123',
    chatId: '42',
    username: 'user',
  };

  function buildNode(message?: string): EndAppNode {
    return {
      id: 'end-1',
      type: 'end',
      position: { x: 0, y: 0 },
      data: { message },
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
    vi.mocked(prisma.botResponse.create).mockResolvedValue({} as never);
  });

  test('should persist collected responses to BotResponse when there are any', async () => {
    const tempData: TempData = {
      answers: {},
      responses: [{ question: 'Name', answer: 'Alice' }],
    };

    await endHandler.handle(buildParams({ tempData }));

    expect(prisma.botResponse.create).toHaveBeenCalledWith({
      data: {
        botId: mockContext.botId,
        telegramChatId: mockContext.chatId,
        answers: [{ question: 'Name', answer: 'Alice' }],
      },
    });
  });

  test('should not touch the database when there are no collected responses', async () => {
    const tempData: TempData = { answers: {}, responses: [] };

    await endHandler.handle(buildParams({ tempData }));

    expect(prisma.botResponse.create).not.toHaveBeenCalled();
  });

  test('should reset tempData.responses after persisting', async () => {
    const tempData: TempData = {
      answers: {},
      responses: [{ question: 'Name', answer: 'Alice' }],
    };

    await endHandler.handle(buildParams({ tempData }));

    expect(tempData.responses).toEqual([]);
  });

  test('should send the configured end message', async () => {
    const node = buildNode('Thanks for chatting!');

    await endHandler.handle(buildParams({ node, nodesById: new Map([[node.id, node]]) }));

    expect(sendTelegramMessage).toHaveBeenCalledWith(
      mockContext.botToken,
      42,
      'Thanks for chatting!'
    );
  });

  test('should fall back to a default message when none is configured', async () => {
    const node = buildNode(undefined);

    await endHandler.handle(buildParams({ node, nodesById: new Map([[node.id, node]]) }));

    expect(sendTelegramMessage).toHaveBeenCalledWith(
      mockContext.botToken,
      42,
      'Dialog ended. Thank you!'
    );
  });

  test('should always return a null nextNodeId, terminating the workflow', async () => {
    const result = await endHandler.handle(buildParams());

    expect(result).toEqual({ nextNodeId: null });
  });

  test('should throw when chatId is not a valid number', async () => {
    await expect(
      endHandler.handle(buildParams({ context: { ...mockContext, chatId: 'nan' } }))
    ).rejects.toThrow('Invalid chatId: nan');
  });
});
