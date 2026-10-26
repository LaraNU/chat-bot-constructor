import { describe, test, expect } from 'vitest';

import {
  makeChoiceNode,
  makeConditionNode,
  makeEdge,
  makeEndNode,
  makeMessageNode,
  makeQuestionNode,
  makeStartNode,
  makeValidLinearWorkflow,
} from '../validation/test-utils/fixtures';

import { findNodesInUnsafeCycles, wouldCreateUnsafeCycle } from './find-unsafe-cycles';

describe('findNodesInUnsafeCycles', () => {
  test('should return an empty set for an acyclic graph', () => {
    const { nodes, edges } = makeValidLinearWorkflow();

    expect(findNodesInUnsafeCycles(nodes, edges)).toEqual(new Set());
  });

  test('should report a self-loop on a non-waiting node', () => {
    const nodes = [makeMessageNode('msg-a')];
    const edges = [makeEdge('e1', 'msg-a', 'msg-a')];

    expect(findNodesInUnsafeCycles(nodes, edges)).toEqual(new Set(['msg-a']));
  });

  test('should report every node of a message-only cycle', () => {
    const nodes = [makeStartNode(), makeMessageNode('msg-a'), makeMessageNode('msg-b')];
    const edges = [
      makeEdge('e1', 'start-1', 'msg-a'),
      makeEdge('e2', 'msg-a', 'msg-b'),
      makeEdge('e3', 'msg-b', 'msg-a'),
    ];

    expect(findNodesInUnsafeCycles(nodes, edges)).toEqual(new Set(['msg-a', 'msg-b']));
  });

  test.each(['true', 'false'])(
    'should report a cycle closed by the `%s` condition branch',
    (branch) => {
      const otherBranch = branch === 'true' ? 'false' : 'true';
      const nodes = [makeMessageNode('msg-a'), makeConditionNode('cond-1'), makeEndNode()];
      const edges = [
        makeEdge('e1', 'msg-a', 'cond-1'),
        makeEdge('e2', 'cond-1', 'msg-a', branch),
        makeEdge('e3', 'cond-1', 'end-1', otherBranch),
      ];

      expect(findNodesInUnsafeCycles(nodes, edges)).toEqual(new Set(['msg-a', 'cond-1']));
    }
  );

  test('should allow a cycle that passes through a question node', () => {
    const nodes = [makeQuestionNode('q-1'), makeConditionNode('cond-1'), makeMessageNode('msg-a')];
    const edges = [
      makeEdge('e1', 'q-1', 'cond-1'),
      makeEdge('e2', 'cond-1', 'msg-a', 'false'),
      makeEdge('e3', 'msg-a', 'q-1'),
    ];

    expect(findNodesInUnsafeCycles(nodes, edges)).toEqual(new Set());
  });

  test('should allow a cycle that passes through a choice node', () => {
    const nodes = [makeChoiceNode('choice-1'), makeMessageNode('msg-a')];
    const edges = [
      makeEdge('e1', 'choice-1', 'msg-a', 'btn-a'),
      makeEdge('e2', 'msg-a', 'choice-1'),
    ];

    expect(findNodesInUnsafeCycles(nodes, edges)).toEqual(new Set());
  });

  test('should report only the unsafe cycle when safe and unsafe cycles coexist', () => {
    const nodes = [
      makeQuestionNode('q-1'),
      makeMessageNode('msg-a'),
      makeMessageNode('msg-b'),
      makeMessageNode('msg-c'),
    ];
    const edges = [
      makeEdge('e1', 'q-1', 'msg-a'),
      makeEdge('e2', 'msg-a', 'q-1'),
      makeEdge('e3', 'msg-a', 'msg-b'),
      makeEdge('e4', 'msg-b', 'msg-c'),
      makeEdge('e5', 'msg-c', 'msg-b'),
    ];

    expect(findNodesInUnsafeCycles(nodes, edges)).toEqual(new Set(['msg-b', 'msg-c']));
  });

  test('should ignore edges that reference missing nodes', () => {
    const nodes = [makeMessageNode('msg-a')];
    const edges = [makeEdge('e1', 'msg-a', 'ghost'), makeEdge('e2', 'ghost', 'msg-a')];

    expect(findNodesInUnsafeCycles(nodes, edges)).toEqual(new Set());
  });
});

describe('wouldCreateUnsafeCycle', () => {
  test('should return true when the connection closes a message-only cycle', () => {
    const nodes = [makeMessageNode('msg-a'), makeMessageNode('msg-b')];
    const edges = [makeEdge('e1', 'msg-a', 'msg-b')];

    expect(wouldCreateUnsafeCycle(nodes, edges, { source: 'msg-b', target: 'msg-a' })).toBe(true);
  });

  test('should return true for a self-connection of a non-waiting node', () => {
    const nodes = [makeMessageNode('msg-a')];

    expect(wouldCreateUnsafeCycle(nodes, [], { source: 'msg-a', target: 'msg-a' })).toBe(true);
  });

  test('should return false when the cycle would pass through a waiting node', () => {
    const nodes = [makeQuestionNode('q-1'), makeMessageNode('msg-a')];
    const edges = [makeEdge('e1', 'q-1', 'msg-a')];

    expect(wouldCreateUnsafeCycle(nodes, edges, { source: 'msg-a', target: 'q-1' })).toBe(false);
  });

  test('should return false when a waiting node sits in the middle of the would-be cycle', () => {
    const nodes = [makeMessageNode('msg-a'), makeChoiceNode('choice-1'), makeMessageNode('msg-b')];
    const edges = [
      makeEdge('e1', 'msg-a', 'choice-1'),
      makeEdge('e2', 'choice-1', 'msg-b', 'btn-a'),
    ];

    expect(wouldCreateUnsafeCycle(nodes, edges, { source: 'msg-b', target: 'msg-a' })).toBe(false);
  });

  test('should return false for a forward connection that closes no cycle', () => {
    const nodes = [makeMessageNode('msg-a'), makeMessageNode('msg-b'), makeEndNode()];
    const edges = [makeEdge('e1', 'msg-a', 'msg-b')];

    expect(wouldCreateUnsafeCycle(nodes, edges, { source: 'msg-b', target: 'end-1' })).toBe(false);
  });

  test('should return false when an endpoint does not exist', () => {
    const nodes = [makeMessageNode('msg-a')];

    expect(wouldCreateUnsafeCycle(nodes, [], { source: 'msg-a', target: 'ghost' })).toBe(false);
  });
});
