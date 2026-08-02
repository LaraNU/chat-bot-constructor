import { vi, beforeEach, describe, test, expect } from 'vitest';

import { choiceHandler } from './choice-handler';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { ChoiceAppNode } from '@/entities/workflow';
import type { UserContext } from '../../model/types';
import type { NodeHandlerParams } from './types';

vi.mock('@/shared/api/telegram/client', () => ({
  sendTelegramMessage: vi.fn(),
}));

describe('choiceHandler', () => {
  const mockContext: UserContext = {
    botId: 'bot-1',
    botToken: 'token-123',
    chatId: '42',
    username: 'user',
  };

  function buildNode(overrides: Partial<ChoiceAppNode['data']> = {}): ChoiceAppNode {
    return {
      id: 'choice-1',
      type: 'choice',
      position: { x: 0, y: 0 },
      data: {
        text: 'Pick one',
        buttons: [
          { id: 'yes', text: 'Yes' },
          { id: 'no', text: 'No' },
        ],
        ...overrides,
      },
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
    test('should send the buttons as an inline keyboard and stop for the user reply', async () => {
      const node = buildNode();

      const result = await choiceHandler.handle(
        buildParams({ node, nodesById: new Map([[node.id, node]]) })
      );

      expect(sendTelegramMessage).toHaveBeenCalledWith(mockContext.botToken, 42, 'Pick one', {
        inline_keyboard: [
          [
            { text: 'Yes', callback_data: 'yes' },
            { text: 'No', callback_data: 'no' },
          ],
        ],
      });
      expect(result).toEqual({ nextNodeId: node.id, shouldStop: true });
    });

    test('should throw when there are no buttons configured', async () => {
      const node = buildNode({ buttons: [] });

      await expect(
        choiceHandler.handle(buildParams({ node, nodesById: new Map([[node.id, node]]) }))
      ).rejects.toThrow(`Choice node ${node.id} has no buttons configured`);

      expect(sendTelegramMessage).not.toHaveBeenCalled();
    });

    test('should throw when chatId is not a valid number', async () => {
      await expect(
        choiceHandler.handle(buildParams({ context: { ...mockContext, chatId: 'nan' } }))
      ).rejects.toThrow('Invalid chatId: nan');
    });
  });

  describe('resuming with the user selection', () => {
    function buildResumeParams(callbackData?: string) {
      const node = buildNode();
      const edgesBySource = new Map([
        [
          node.id,
          [
            { id: 'e-yes', source: node.id, target: 'yes-node', sourceHandle: 'yes' },
            { id: 'e-no', source: node.id, target: 'no-node', sourceHandle: 'no' },
          ],
        ],
      ]);

      return buildParams({
        node,
        nodesById: new Map([[node.id, node]]),
        edgesBySource,
        initialNodeId: node.id,
        context: { ...mockContext, callbackData },
      });
    }

    test('should record the chosen button and follow the matching sourceHandle edge', async () => {
      const params = buildResumeParams('yes');

      const result = await choiceHandler.handle(params);

      expect(params.tempData.answers['choice-1']).toEqual({ nodeId: 'choice-1', buttonId: 'yes' });
      expect(result).toEqual({ nextNodeId: 'yes-node' });
    });

    test('should throw when the callback data is missing', async () => {
      const params = buildResumeParams(undefined);

      await expect(choiceHandler.handle(params)).rejects.toThrow(
        'Missing callback data for choice node choice-1'
      );
    });

    test('should throw when the callback data does not match any configured button', async () => {
      const params = buildResumeParams('unknown-button');

      await expect(choiceHandler.handle(params)).rejects.toThrow(
        'Invalid button ID "unknown-button" for choice node choice-1'
      );
    });

    test('should return null nextNodeId when no edge matches the chosen button', async () => {
      const node = buildNode();

      const result = await choiceHandler.handle(
        buildParams({
          node,
          nodesById: new Map([[node.id, node]]),
          initialNodeId: node.id,
          context: { ...mockContext, callbackData: 'yes' },
        })
      );

      expect(result).toEqual({ nextNodeId: null });
    });
  });
});
