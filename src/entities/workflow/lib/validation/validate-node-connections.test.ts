import { describe, expect, it } from 'vitest';

import { validateNodeConnections } from './validate-node-connections';
import {
  makeChoiceNode,
  makeConditionNode,
  makeEdge,
  makeEndNode,
  makeMessageNode,
  makeQuestionNode,
  makeStartNode,
  makeSummaryNode,
} from './test-utils/fixtures';
import type { AppEdge, AppNode } from '../../model/types';

describe('validateNodeConnections', () => {
  describe('condition node branches', () => {
    it('emits CONDITION_MISSING_TRUE_BRANCH when true edge is absent', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeConditionNode('cond-1'),
        makeEndNode('end-1'),
        makeEndNode('end-2'),
      ];
      // Only false branch connected
      const edges = [
        makeEdge('e1', 'start-1', 'cond-1'),
        makeEdge('e2', 'cond-1', 'end-2', 'false'),
      ];

      const issues = validateNodeConnections(nodes, edges);

      expect(issues).toContainEqual(
        expect.objectContaining({
          code: 'CONDITION_MISSING_TRUE_BRANCH',
          severity: 'error',
          nodeId: 'cond-1',
        })
      );
      expect(issues.map((i) => i.code)).not.toContain('CONDITION_MISSING_FALSE_BRANCH');
    });

    it('emits CONDITION_MISSING_FALSE_BRANCH when false edge is absent', () => {
      const nodes: AppNode[] = [makeStartNode(), makeConditionNode('cond-1'), makeEndNode('end-1')];
      // Only true branch connected
      const edges = [
        makeEdge('e1', 'start-1', 'cond-1'),
        makeEdge('e2', 'cond-1', 'end-1', 'true'),
      ];

      const issues = validateNodeConnections(nodes, edges);

      expect(issues).toContainEqual(
        expect.objectContaining({
          code: 'CONDITION_MISSING_FALSE_BRANCH',
          severity: 'error',
          nodeId: 'cond-1',
        })
      );
      expect(issues.map((i) => i.code)).not.toContain('CONDITION_MISSING_TRUE_BRANCH');
    });

    it('emits both branch errors when condition has no outgoing edges', () => {
      const nodes: AppNode[] = [makeStartNode(), makeConditionNode('cond-1')];
      const edges = [makeEdge('e1', 'start-1', 'cond-1')];

      const issues = validateNodeConnections(nodes, edges);

      const codes = issues.map((i) => i.code);
      expect(codes).toContain('CONDITION_MISSING_TRUE_BRANCH');
      expect(codes).toContain('CONDITION_MISSING_FALSE_BRANCH');
    });

    it('emits no branch errors when both branches are connected', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeConditionNode('cond-1'),
        makeEndNode('end-1'),
        makeEndNode('end-2'),
      ];
      const edges = [
        makeEdge('e1', 'start-1', 'cond-1'),
        makeEdge('e2', 'cond-1', 'end-1', 'true'),
        makeEdge('e3', 'cond-1', 'end-2', 'false'),
      ];

      const issues = validateNodeConnections(nodes, edges);

      const codes = issues.map((i) => i.code);
      expect(codes).not.toContain('CONDITION_MISSING_TRUE_BRANCH');
      expect(codes).not.toContain('CONDITION_MISSING_FALSE_BRANCH');
    });
  });

  describe('choice node button edges', () => {
    it('emits CHOICE_BUTTON_NO_EDGE for each button without a corresponding edge', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeChoiceNode('choice-1', {
          text: 'Choose:',
          buttons: [
            { id: 'btn-a', text: 'Option A' },
            { id: 'btn-b', text: 'Option B' },
          ],
        }),
        makeEndNode(),
      ];
      // Neither button has an edge
      const edges = [makeEdge('e1', 'start-1', 'choice-1')];

      const issues = validateNodeConnections(nodes, edges);

      const choiceErrors = issues.filter((i) => i.code === 'CHOICE_BUTTON_NO_EDGE');
      expect(choiceErrors).toHaveLength(2);
      expect(choiceErrors[0].nodeId).toBe('choice-1');
      expect(choiceErrors[1].nodeId).toBe('choice-1');
    });

    it('emits CHOICE_BUTTON_NO_EDGE only for the button that has no edge', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeChoiceNode('choice-1', {
          text: 'Choose:',
          buttons: [
            { id: 'btn-a', text: 'Option A' },
            { id: 'btn-b', text: 'Option B' },
          ],
        }),
        makeEndNode('end-1'),
        makeEndNode('end-2'),
      ];
      // Only btn-a has an edge
      const edges = [
        makeEdge('e1', 'start-1', 'choice-1'),
        makeEdge('e2', 'choice-1', 'end-1', 'btn-a'),
      ];

      const issues = validateNodeConnections(nodes, edges);

      const choiceErrors = issues.filter((i) => i.code === 'CHOICE_BUTTON_NO_EDGE');
      expect(choiceErrors).toHaveLength(1);
      expect(choiceErrors[0].messageParams?.buttonId).toBe('btn-b');
    });

    it('emits no errors when all buttons have corresponding edges', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeChoiceNode('choice-1', {
          text: 'Choose:',
          buttons: [
            { id: 'btn-a', text: 'A' },
            { id: 'btn-b', text: 'B' },
          ],
        }),
        makeEndNode('end-1'),
        makeEndNode('end-2'),
      ];
      const edges = [
        makeEdge('e1', 'start-1', 'choice-1'),
        makeEdge('e2', 'choice-1', 'end-1', 'btn-a'),
        makeEdge('e3', 'choice-1', 'end-2', 'btn-b'),
      ];

      const issues = validateNodeConnections(nodes, edges);

      expect(issues.map((i) => i.code)).not.toContain('CHOICE_BUTTON_NO_EDGE');
    });

    it('emits no errors for a choice node with an empty buttons array (data check is separate)', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeChoiceNode('choice-1', { text: 'Choose:', buttons: [] }),
        makeEndNode(),
      ];
      const edges = [makeEdge('e1', 'start-1', 'choice-1')];

      const issues = validateNodeConnections(nodes, edges);

      // Connection check has nothing to iterate — the CHOICE_NO_BUTTONS error
      // comes from validateNodeData, not from validateNodeConnections.
      expect(issues.map((i) => i.code)).not.toContain('CHOICE_BUTTON_NO_EDGE');
    });
  });

  describe('unrelated node types', () => {
    it('does not emit any issues for message or end nodes', () => {
      const nodes: AppNode[] = [makeStartNode(), makeMessageNode('msg-1'), makeEndNode()];
      const edges = [makeEdge('e1', 'start-1', 'msg-1'), makeEdge('e2', 'msg-1', 'end-1')];

      const issues = validateNodeConnections(nodes, edges);

      expect(issues).toHaveLength(0);
    });
  });

  describe('output cardinality', () => {
    const multipleEdgeIssues = (nodes: AppNode[], edges: AppEdge[]) =>
      validateNodeConnections(nodes, edges).filter((i) => i.code === 'MULTIPLE_EDGES_FROM_OUTPUT');

    it('emits one MULTIPLE_EDGES_FROM_OUTPUT error for a message with two edges', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeMessageNode('msg-1'),
        makeEndNode('end-1'),
        makeEndNode('end-2'),
      ];
      const edges = [
        makeEdge('e1', 'start-1', 'msg-1'),
        makeEdge('e2', 'msg-1', 'end-1'),
        makeEdge('e3', 'msg-1', 'end-2'),
      ];

      expect(multipleEdgeIssues(nodes, edges)).toEqual([
        {
          severity: 'error',
          code: 'MULTIPLE_EDGES_FROM_OUTPUT',
          nodeId: 'msg-1',
          messageKey: 'validation.multipleEdgesFromOutput',
          messageParams: { handleId: '', count: '2' },
        },
      ]);
    });

    it('emits MULTIPLE_EDGES_FROM_OUTPUT for two edges from the same choice button', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeChoiceNode('choice-1'),
        makeEndNode('end-1'),
        makeEndNode('end-2'),
        makeEndNode('end-3'),
      ];
      const edges = [
        makeEdge('e1', 'start-1', 'choice-1'),
        makeEdge('e2', 'choice-1', 'end-1', 'btn-a'),
        makeEdge('e3', 'choice-1', 'end-2', 'btn-a'),
        makeEdge('e4', 'choice-1', 'end-3', 'btn-b'),
      ];

      expect(multipleEdgeIssues(nodes, edges)).toEqual([
        expect.objectContaining({
          nodeId: 'choice-1',
          messageParams: { handleId: 'btn-a', count: '2' },
        }),
      ]);
    });

    it('emits no error for one edge per condition branch and per choice button', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeConditionNode('cond-1'),
        makeChoiceNode('choice-1'),
        makeEndNode('end-1'),
        makeEndNode('end-2'),
        makeEndNode('end-3'),
      ];
      const edges = [
        makeEdge('e1', 'start-1', 'cond-1'),
        makeEdge('e2', 'cond-1', 'choice-1', 'true'),
        makeEdge('e3', 'cond-1', 'end-1', 'false'),
        makeEdge('e4', 'choice-1', 'end-2', 'btn-a'),
        makeEdge('e5', 'choice-1', 'end-3', 'btn-b'),
      ];

      expect(multipleEdgeIssues(nodes, edges)).toHaveLength(0);
    });

    it('treats an edge without sourceHandle and an edge with null sourceHandle as one output', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeMessageNode('msg-1'),
        makeEndNode('end-1'),
        makeEndNode('end-2'),
      ];
      const edges: AppEdge[] = [
        makeEdge('e1', 'start-1', 'msg-1'),
        makeEdge('e2', 'msg-1', 'end-1'),
        { ...makeEdge('e3', 'msg-1', 'end-2'), sourceHandle: null },
      ];

      expect(multipleEdgeIssues(nodes, edges)).toEqual([
        expect.objectContaining({ nodeId: 'msg-1', messageParams: { handleId: '', count: '2' } }),
      ]);
    });
  });

  describe('nodes without an outgoing edge', () => {
    const deadEndIssues = (nodes: AppNode[], edges: AppEdge[]) =>
      validateNodeConnections(nodes, edges).filter((i) => i.code === 'NODE_HAS_NO_OUTGOING_EDGE');

    it('emits a NODE_HAS_NO_OUTGOING_EDGE warning for dead-end message, question and summary', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeMessageNode('msg-1'),
        makeQuestionNode('q-1'),
        makeSummaryNode('sum-1'),
      ];
      const edges = [makeEdge('e1', 'start-1', 'msg-1')];

      const issues = deadEndIssues(nodes, edges);

      expect(issues.map((i) => i.nodeId)).toEqual(['msg-1', 'q-1', 'sum-1']);
      expect(issues.every((i) => i.severity === 'warning')).toBe(true);
      expect(issues[0].messageKey).toBe('validation.nodeHasNoOutgoingEdge');
    });

    it('does not emit the warning for end, start, choice and condition', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeChoiceNode('choice-1'),
        makeConditionNode('cond-1'),
        makeEndNode(),
      ];

      expect(deadEndIssues(nodes, [])).toHaveLength(0);
    });

    it('does not emit the warning for a linear node with an outgoing edge', () => {
      const nodes: AppNode[] = [makeStartNode(), makeMessageNode('msg-1'), makeEndNode()];
      const edges = [makeEdge('e1', 'start-1', 'msg-1'), makeEdge('e2', 'msg-1', 'end-1')];

      expect(deadEndIssues(nodes, edges)).toHaveLength(0);
    });
  });
});
