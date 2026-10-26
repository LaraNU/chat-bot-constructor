import { describe, expect, it } from 'vitest';

import { validateCycles } from './validate-cycles';
import {
  makeChoiceNode,
  makeConditionNode,
  makeEdge,
  makeEndNode,
  makeMessageNode,
  makeQuestionNode,
  makeValidLinearWorkflow,
} from './test-utils/fixtures';

describe('validateCycles', () => {
  it('returns no issues for an acyclic graph', () => {
    const { nodes, edges } = makeValidLinearWorkflow();

    expect(validateCycles(nodes, edges)).toEqual([]);
  });

  it('reports one error per node of a two-message cycle', () => {
    const nodes = [makeMessageNode('msg-a'), makeMessageNode('msg-b')];
    const edges = [makeEdge('e1', 'msg-a', 'msg-b'), makeEdge('e2', 'msg-b', 'msg-a')];

    const issues = validateCycles(nodes, edges);

    expect(issues).toHaveLength(2);
    expect(issues.map((i) => i.nodeId).sort()).toEqual(['msg-a', 'msg-b']);
    for (const issue of issues) {
      expect(issue).toMatchObject({
        severity: 'error',
        code: 'CYCLE_WITHOUT_WAITING_NODE',
        messageKey: 'validation.cycleWithoutWaitingNode',
      });
    }
  });

  it('reports a self-loop', () => {
    const nodes = [makeMessageNode('msg-a')];
    const edges = [makeEdge('e1', 'msg-a', 'msg-a')];

    expect(validateCycles(nodes, edges)).toEqual([
      expect.objectContaining({ code: 'CYCLE_WITHOUT_WAITING_NODE', nodeId: 'msg-a' }),
    ]);
  });

  it('reports a cycle closed by a condition branch', () => {
    const nodes = [makeMessageNode('msg-a'), makeConditionNode('cond-1'), makeEndNode('end-1')];
    const edges = [
      makeEdge('e1', 'msg-a', 'cond-1'),
      makeEdge('e2', 'cond-1', 'end-1', 'true'),
      makeEdge('e3', 'cond-1', 'msg-a', 'false'),
    ];

    expect(
      validateCycles(nodes, edges)
        .map((i) => i.nodeId)
        .sort()
    ).toEqual(['cond-1', 'msg-a']);
  });

  it('accepts a cycle through a question node', () => {
    const nodes = [makeQuestionNode('q-1'), makeConditionNode('cond-1'), makeMessageNode('msg-a')];
    const edges = [
      makeEdge('e1', 'q-1', 'cond-1'),
      makeEdge('e2', 'cond-1', 'msg-a', 'false'),
      makeEdge('e3', 'msg-a', 'q-1'),
    ];

    expect(validateCycles(nodes, edges)).toEqual([]);
  });

  it('accepts a cycle through a choice node', () => {
    const nodes = [makeChoiceNode('choice-1'), makeMessageNode('msg-a')];
    const edges = [
      makeEdge('e1', 'choice-1', 'msg-a', 'btn-a'),
      makeEdge('e2', 'msg-a', 'choice-1'),
    ];

    expect(validateCycles(nodes, edges)).toEqual([]);
  });
});
