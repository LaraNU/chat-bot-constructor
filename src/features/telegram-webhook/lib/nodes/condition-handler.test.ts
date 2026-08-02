import { describe, test, expect } from 'vitest';

import { conditionHandler } from './condition-handler';
import type { ConditionAppNode } from '@/entities/workflow';
import type { UserContext } from '../../model/types';
import type { NodeHandlerParams } from './types';

describe('conditionHandler', () => {
  const mockContext: UserContext = {
    botId: 'bot-1',
    botToken: 'token-123',
    chatId: '42',
    username: 'user',
  };

  function buildNode(overrides: Partial<ConditionAppNode['data']> = {}): ConditionAppNode {
    return {
      id: 'condition-1',
      type: 'condition',
      position: { x: 0, y: 0 },
      data: {
        questionNodeId: 'question-1',
        operator: 'equals',
        value: 'yes',
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
      edgesBySource: new Map([
        [
          node.id,
          [
            { id: 'e-true', source: node.id, target: 'true-node', sourceHandle: 'true' },
            { id: 'e-false', source: node.id, target: 'false-node', sourceHandle: 'false' },
          ],
        ],
      ]),
      context: mockContext,
      tempData: { answers: {}, responses: [] },
      initialNodeId: null,
      ...overrides,
    };
  }

  test('should follow the "true" edge when the equals operator matches', async () => {
    const node = buildNode({ operator: 'equals', value: 'yes' });

    const result = await conditionHandler.handle(
      buildParams({
        node,
        tempData: {
          answers: { 'question-1': { nodeId: 'question-1', text: 'yes' } },
          responses: [],
        },
      })
    );

    expect(result).toEqual({ nextNodeId: 'true-node' });
  });

  test('should follow the "false" edge when the equals operator does not match', async () => {
    const node = buildNode({ operator: 'equals', value: 'yes' });

    const result = await conditionHandler.handle(
      buildParams({
        node,
        tempData: {
          answers: { 'question-1': { nodeId: 'question-1', text: 'no' } },
          responses: [],
        },
      })
    );

    expect(result).toEqual({ nextNodeId: 'false-node' });
  });

  test('should follow the "true" edge when the contains operator matches a substring', async () => {
    const node = buildNode({ operator: 'contains', value: 'ell' });

    const result = await conditionHandler.handle(
      buildParams({
        node,
        tempData: {
          answers: { 'question-1': { nodeId: 'question-1', text: 'hello' } },
          responses: [],
        },
      })
    );

    expect(result).toEqual({ nextNodeId: 'true-node' });
  });

  test('should treat a missing answer as an empty string', async () => {
    const node = buildNode({ operator: 'equals', value: '' });

    const result = await conditionHandler.handle(
      buildParams({ node, tempData: { answers: {}, responses: [] } })
    );

    expect(result).toEqual({ nextNodeId: 'true-node' });
  });

  test('should return null nextNodeId when no edge matches the outcome', async () => {
    const node = buildNode({ operator: 'equals', value: 'yes' });

    const result = await conditionHandler.handle(
      buildParams({
        node,
        edgesBySource: new Map(),
        tempData: {
          answers: { 'question-1': { nodeId: 'question-1', text: 'yes' } },
          responses: [],
        },
      })
    );

    expect(result).toEqual({ nextNodeId: null });
  });
});
