import { vi, beforeEach, describe, test, expect } from 'vitest';

import { runWorkflowEngine } from './engine';
import { getNodeHandler } from './nodes/registry';
import type { AppNode, AppEdge } from '@/entities/workflow';
import type { UserContext } from '../model/types';
import type { NodeHandler } from './nodes/types';

vi.mock('./nodes/registry', () => ({
  getNodeHandler: vi.fn(),
}));

describe('runWorkflowEngine', () => {
  const mockContext: UserContext = {
    botId: 'bot-1',
    botToken: 'token',
    chatId: '1',
    username: 'user',
  };

  function buildNode(id: string, type: AppNode['type']): AppNode {
    return {
      id,
      type,
      position: { x: 0, y: 0 },
      data: {} as never,
    } as AppNode;
  }

  function buildEdge(source: string, target: string, sourceHandle?: string): AppEdge {
    return { id: `${source}-${target}`, source, target, sourceHandle };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should enter the graph via the edge leaving `start` and walk until a handler returns no next node', async () => {
    // The engine never invokes a handler for the `start` node itself — it uses the
    // edge leaving it purely to find the first real node to execute.
    const startNode = buildNode('start-1', 'start');
    const messageNode = buildNode('message-1', 'message');
    const endNode = buildNode('end-1', 'end');

    const nodes = [startNode, messageNode, endNode];
    const edges = [buildEdge('start-1', 'message-1'), buildEdge('message-1', 'end-1')];

    const messageHandler: NodeHandler = {
      handle: vi.fn().mockResolvedValue({ nextNodeId: 'end-1' }),
    };
    const endHandler: NodeHandler = {
      handle: vi.fn().mockResolvedValue({ nextNodeId: null }),
    };

    vi.mocked(getNodeHandler).mockImplementation((type) =>
      type === 'message' ? messageHandler : type === 'end' ? endHandler : undefined
    );

    const result = await runWorkflowEngine({
      nodes,
      edges,
      initialNodeId: null,
      context: mockContext,
    });

    expect(result).toBeNull();
    expect(getNodeHandler).not.toHaveBeenCalledWith('start');
    expect(messageHandler.handle).toHaveBeenCalledTimes(1);
    expect(endHandler.handle).toHaveBeenCalledTimes(1);
  });

  test('should stop the loop and return the node id when a handler sets shouldStop', async () => {
    const startNode = buildNode('start-1', 'start');
    const questionNode = buildNode('question-1', 'question');

    const nodes = [startNode, questionNode];
    const edges = [buildEdge('start-1', 'question-1')];

    const questionHandler: NodeHandler = {
      handle: vi.fn().mockResolvedValue({ nextNodeId: 'question-1', shouldStop: true }),
    };

    vi.mocked(getNodeHandler).mockImplementation((type) =>
      type === 'question' ? questionHandler : undefined
    );

    const result = await runWorkflowEngine({
      nodes,
      edges,
      initialNodeId: null,
      context: mockContext,
    });

    expect(result).toBe('question-1');
    // The loop must stop immediately on shouldStop, never re-invoking the handler.
    expect(questionHandler.handle).toHaveBeenCalledTimes(1);
  });

  test('should resume directly from initialNodeId instead of re-entering via `start`', async () => {
    const questionNode = buildNode('question-1', 'question');
    const messageNode = buildNode('message-1', 'message');

    const nodes = [questionNode, messageNode];
    const edges = [buildEdge('question-1', 'message-1')];

    const questionHandler: NodeHandler = {
      handle: vi.fn().mockResolvedValue({ nextNodeId: 'message-1' }),
    };
    const messageHandler: NodeHandler = {
      handle: vi.fn().mockResolvedValue({ nextNodeId: null }),
    };

    vi.mocked(getNodeHandler).mockImplementation((type) =>
      type === 'question' ? questionHandler : type === 'message' ? messageHandler : undefined
    );

    const result = await runWorkflowEngine({
      nodes,
      edges,
      initialNodeId: 'question-1',
      context: mockContext,
    });

    expect(result).toBeNull();
    expect(questionHandler.handle).toHaveBeenCalledWith(
      expect.objectContaining({ node: questionNode, initialNodeId: 'question-1' })
    );
  });

  test('should stop without invoking any handler when the entry node no longer exists in the graph', async () => {
    const startNode = buildNode('start-1', 'start');

    const result = await runWorkflowEngine({
      nodes: [startNode],
      edges: [buildEdge('start-1', 'missing-node')],
      initialNodeId: null,
      context: mockContext,
    });

    expect(result).toBeNull();
    expect(getNodeHandler).not.toHaveBeenCalled();
  });

  test('should stop without error when no handler is registered for the entry node type', async () => {
    const startNode = buildNode('start-1', 'start');
    const unknownNode = buildNode('unknown-1', 'end');

    vi.mocked(getNodeHandler).mockReturnValue(undefined);

    const result = await runWorkflowEngine({
      nodes: [startNode, unknownNode],
      edges: [buildEdge('start-1', 'unknown-1')],
      initialNodeId: null,
      context: mockContext,
    });

    expect(result).toBeNull();
  });

  test('should return null immediately when there is no start node and nothing to resume', async () => {
    const messageNode = buildNode('message-1', 'message');

    const result = await runWorkflowEngine({
      nodes: [messageNode],
      edges: [],
      initialNodeId: null,
      context: mockContext,
    });

    expect(result).toBeNull();
    expect(getNodeHandler).not.toHaveBeenCalled();
  });

  test('should pass tempData through to the handler and default it when not provided', async () => {
    const startNode = buildNode('start-1', 'start');

    const startHandler: NodeHandler = {
      handle: vi.fn().mockResolvedValue({ nextNodeId: null }),
    };

    vi.mocked(getNodeHandler).mockImplementation((type) =>
      type === 'start' ? startHandler : undefined
    );

    // Resuming directly on the `start` node id is an artificial edge case here,
    // used only to exercise the handler invocation with a known node type.
    await runWorkflowEngine({
      nodes: [startNode],
      edges: [],
      initialNodeId: 'start-1',
      context: mockContext,
    });

    expect(startHandler.handle).toHaveBeenCalledWith(
      expect.objectContaining({ tempData: { answers: {}, responses: [] } })
    );
  });
});
