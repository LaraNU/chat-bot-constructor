import { vi, beforeEach, describe, test, expect } from 'vitest';

import { summaryHandler } from './summary-handler';
import { sendTelegramMessage } from '@/shared/api/telegram/client';
import type { SummaryAppNode, QuestionAppNode, AppNode } from '@/entities/workflow';
import type { UserContext } from '../../model/types';
import type { NodeHandlerParams, TempData } from './types';

vi.mock('@/shared/api/telegram/client', () => ({
  sendTelegramMessage: vi.fn(),
}));

describe('summaryHandler', () => {
  const mockContext: UserContext = {
    botId: 'bot-1',
    botToken: 'token-123',
    chatId: '42',
    username: 'user',
  };

  function buildQuestionNode(id: string, answerLabel: string): QuestionAppNode {
    return {
      id,
      type: 'question',
      position: { x: 0, y: 0 },
      data: { text: `Question ${id}`, answerLabel },
    };
  }

  function buildSummaryNode(overrides: Partial<SummaryAppNode['data']> = {}): SummaryAppNode {
    return {
      id: 'summary-1',
      type: 'summary',
      position: { x: 0, y: 0 },
      data: { includedQuestionIds: [], ...overrides },
    };
  }

  function buildParams(overrides: Partial<NodeHandlerParams> = {}): NodeHandlerParams {
    const node = buildSummaryNode();

    return {
      node,
      nodes: [node],
      edges: [],
      nodesById: new Map<string, AppNode>([[node.id, node]]),
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

  test('should build the default summary from included questions and send it', async () => {
    const nameQuestion = buildQuestionNode('q-name', 'Name');
    const ageQuestion = buildQuestionNode('q-age', 'Age');
    const node = buildSummaryNode({
      introText: 'Here is your summary:',
      includedQuestionIds: ['q-name', 'q-age'],
    });

    const tempData: TempData = {
      answers: {
        'q-name': { nodeId: 'q-name', text: 'Alice' },
        'q-age': { nodeId: 'q-age', text: '30' },
      },
      responses: [],
    };

    const result = await summaryHandler.handle(
      buildParams({
        node,
        nodesById: new Map<string, AppNode>([
          [node.id, node],
          [nameQuestion.id, nameQuestion],
          [ageQuestion.id, ageQuestion],
        ]),
        tempData,
      })
    );

    expect(sendTelegramMessage).toHaveBeenCalledWith(
      mockContext.botToken,
      42,
      'Here is your summary:\n\nName: Alice\nAge: 30'
    );
    expect(result).toEqual({ nextNodeId: null });
  });

  test('should substitute {{label}} placeholders when a customTemplate is provided', async () => {
    const nameQuestion = buildQuestionNode('q-name', 'Name');
    const node = buildSummaryNode({
      includedQuestionIds: ['q-name'],
      customTemplate: 'Hello, {{Name}}!',
    });

    const tempData: TempData = {
      answers: { 'q-name': { nodeId: 'q-name', text: 'Alice' } },
      responses: [],
    };

    await summaryHandler.handle(
      buildParams({
        node,
        nodesById: new Map<string, AppNode>([
          [node.id, node],
          [nameQuestion.id, nameQuestion],
        ]),
        tempData,
      })
    );

    expect(sendTelegramMessage).toHaveBeenCalledWith(mockContext.botToken, 42, 'Hello, Alice!');
  });

  test('should skip questions that no longer exist in the graph', async () => {
    const node = buildSummaryNode({ includedQuestionIds: ['missing-question'] });

    await summaryHandler.handle(buildParams({ node, tempData: { answers: {}, responses: [] } }));

    expect(sendTelegramMessage).not.toHaveBeenCalled();
  });

  test('should not send a message when the final text is empty', async () => {
    const node = buildSummaryNode({ includedQuestionIds: [] });

    const result = await summaryHandler.handle(buildParams({ node }));

    expect(sendTelegramMessage).not.toHaveBeenCalled();
    expect(result).toEqual({ nextNodeId: null });
  });

  test('should follow the outgoing edge after sending the summary', async () => {
    const node = buildSummaryNode({ introText: 'Done' });
    const edgesBySource = new Map([
      [node.id, [{ id: 'e1', source: node.id, target: 'next-node' }]],
    ]);

    const result = await summaryHandler.handle(buildParams({ node, edgesBySource }));

    expect(result).toEqual({ nextNodeId: 'next-node' });
  });
});
