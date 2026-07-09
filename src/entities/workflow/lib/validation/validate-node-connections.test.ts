import { describe, expect, it } from 'vitest';

import { validateNodeConnections } from './validate-node-connections';
import {
  makeChoiceNode,
  makeConditionNode,
  makeEdge,
  makeEndNode,
  makeMessageNode,
  makeStartNode,
} from './test-utils/fixtures';
import type { AppNode } from '../../model/types';

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
});
