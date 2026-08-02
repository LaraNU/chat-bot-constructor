import { vi, beforeEach, describe, test, expect } from 'vitest';

import { messageHandler } from './message-handler';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { MessageAppNode } from '@/entities/workflow';
import type { UserContext } from '../../model/types';
import type { NodeHandlerParams } from './types';

vi.mock('@/shared/api/telegram/client', () => ({
  sendTelegramMessage: vi.fn(),
}));

describe('messageHandler', () => {
  const mockContext: UserContext = {
    botId: 'bot-1',
    botToken: 'token-123',
    chatId: '42',
    username: 'user',
  };

  function buildNode(text: string): MessageAppNode {
    return {
      id: 'message-1',
      type: 'message',
      position: { x: 0, y: 0 },
      data: { text },
    };
  }

  function buildParams(overrides: Partial<NodeHandlerParams> = {}): NodeHandlerParams {
    const node = buildNode('Hello!');

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

  test('should send the node text to the chat and follow the first outgoing edge', async () => {
    const node = buildNode('Hello!');
    const edgesBySource = new Map([
      [node.id, [{ id: 'e1', source: node.id, target: 'next-node' }]],
    ]);

    const result = await messageHandler.handle(
      buildParams({ node, nodesById: new Map([[node.id, node]]), edgesBySource })
    );

    expect(sendTelegramMessage).toHaveBeenCalledWith(mockContext.botToken, 42, 'Hello!');
    expect(result).toEqual({ nextNodeId: 'next-node' });
  });

  test('should return null nextNodeId when there is no outgoing edge', async () => {
    const result = await messageHandler.handle(buildParams());

    expect(result).toEqual({ nextNodeId: null });
  });

  test('should send an empty string when node text is not configured', async () => {
    const node = buildNode(undefined as unknown as string);

    await messageHandler.handle(buildParams({ node, nodesById: new Map([[node.id, node]]) }));

    expect(sendTelegramMessage).toHaveBeenCalledWith(mockContext.botToken, 42, '');
  });

  test('should throw when chatId is not a valid number', async () => {
    await expect(
      messageHandler.handle(buildParams({ context: { ...mockContext, chatId: 'not-a-number' } }))
    ).rejects.toThrow('Invalid chatId: not-a-number');

    expect(sendTelegramMessage).not.toHaveBeenCalled();
  });
});
