import { describe, expect, it } from 'vitest';

import { validateWorkflow } from './validate-workflow';
import {
  makeChoiceNode,
  makeConditionNode,
  makeEdge,
  makeEndNode,
  makeMessageNode,
  makeQuestionNode,
  makeStartNode,
  makeSummaryNode,
  makeValidLinearWorkflow,
} from './test-utils/fixtures';
import type { AppEdge, AppNode } from '../../model/types';

describe('validateWorkflow', () => {
  describe('valid workflows', () => {
    it('returns isValid=true with no issues for a valid linear workflow', () => {
      const workflow = makeValidLinearWorkflow();

      const result = validateWorkflow(workflow);

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.errorCount).toBe(0);
      expect(result.warningCount).toBe(0);
    });

    it('returns isValid=true for a valid workflow with a question and condition', () => {
      const nodes: AppNode[] = [
        makeStartNode('start-1'),
        makeQuestionNode('q-1'),
        makeConditionNode('cond-1', { questionNodeId: 'q-1', operator: 'equals', value: 'yes' }),
        makeMessageNode('msg-yes'),
        makeMessageNode('msg-no'),
        makeEndNode('end-1'),
        makeEndNode('end-2'),
      ];
      const edges: AppEdge[] = [
        makeEdge('e1', 'start-1', 'q-1'),
        makeEdge('e2', 'q-1', 'cond-1'),
        makeEdge('e3', 'cond-1', 'msg-yes', 'true'),
        makeEdge('e4', 'cond-1', 'msg-no', 'false'),
        makeEdge('e5', 'msg-yes', 'end-1'),
        makeEdge('e6', 'msg-no', 'end-2'),
      ];

      const result = validateWorkflow({ nodes, edges });

      expect(result.isValid).toBe(true);
      expect(result.errorCount).toBe(0);
    });

    it('returns isValid=true for a valid workflow with a choice node', () => {
      const nodes: AppNode[] = [
        makeStartNode('start-1'),
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
      const edges: AppEdge[] = [
        makeEdge('e1', 'start-1', 'choice-1'),
        makeEdge('e2', 'choice-1', 'end-1', 'btn-a'),
        makeEdge('e3', 'choice-1', 'end-2', 'btn-b'),
      ];

      const result = validateWorkflow({ nodes, edges });

      expect(result.isValid).toBe(true);
      expect(result.errorCount).toBe(0);
    });
  });

  describe('invalid workflows — errors block isValid', () => {
    it('returns isValid=false when the workflow has no nodes', () => {
      const result = validateWorkflow({ nodes: [], edges: [] });

      expect(result.isValid).toBe(false);
      expect(result.errorCount).toBeGreaterThan(0);
    });

    it('returns isValid=false when start node is missing', () => {
      const nodes: AppNode[] = [makeMessageNode('msg-1'), makeEndNode()];
      const edges: AppEdge[] = [makeEdge('e1', 'msg-1', 'end-1')];

      const result = validateWorkflow({ nodes, edges });

      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.code === 'NO_START_NODE')).toBe(true);
    });

    it('returns isValid=false when start node is not connected', () => {
      const nodes: AppNode[] = [makeStartNode(), makeEndNode()];

      const result = validateWorkflow({ nodes, edges: [] });

      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.code === 'START_NODE_NOT_CONNECTED')).toBe(true);
    });

    it('returns isValid=false when condition node is missing a branch', () => {
      const nodes: AppNode[] = [
        makeStartNode('start-1'),
        makeQuestionNode('q-1'),
        makeConditionNode('cond-1', { questionNodeId: 'q-1' }),
        makeEndNode('end-1'),
      ];
      const edges: AppEdge[] = [
        makeEdge('e1', 'start-1', 'q-1'),
        makeEdge('e2', 'q-1', 'cond-1'),
        makeEdge('e3', 'cond-1', 'end-1', 'true'),
        // false branch is missing
      ];

      const result = validateWorkflow({ nodes, edges });

      expect(result.isValid).toBe(false);
      expect(result.issues.some((i) => i.code === 'CONDITION_MISSING_FALSE_BRANCH')).toBe(true);
    });

    it('accumulates multiple errors from different phases', () => {
      // No start, no end, condition with bad ref, choice with no buttons
      const nodes: AppNode[] = [
        makeConditionNode('cond-1', { questionNodeId: 'deleted-q' }),
        makeChoiceNode('choice-1', { text: 'Pick:', buttons: [] }),
      ];

      const result = validateWorkflow({ nodes, edges: [] });

      const codes = result.issues.map((i) => i.code);
      expect(codes).toContain('NO_START_NODE');
      expect(codes).toContain('NO_END_NODE');
      expect(codes).toContain('CONDITION_INVALID_QUESTION_REF');
      expect(codes).toContain('CHOICE_NO_BUTTONS');
      expect(result.isValid).toBe(false);
    });
  });

  describe('workflows with warnings only', () => {
    it('returns isValid=true when only warnings are present', () => {
      // Valid structure but with an unreachable node and empty summary
      const nodes: AppNode[] = [
        makeStartNode('start-1'),
        makeMessageNode('msg-1'),
        makeEndNode('end-1'),
        makeMessageNode('orphan'), // unreachable → warning
        makeSummaryNode('sum-1', { includedQuestionIds: [] }), // unreachable + no questions → warnings
      ];
      const edges: AppEdge[] = [
        makeEdge('e1', 'start-1', 'msg-1'),
        makeEdge('e2', 'msg-1', 'end-1'),
      ];

      const result = validateWorkflow({ nodes, edges });

      expect(result.isValid).toBe(true);
      expect(result.warningCount).toBeGreaterThan(0);
      expect(result.errorCount).toBe(0);
    });
  });

  describe('result shape', () => {
    it('errorCount and warningCount match the issues list', () => {
      const { nodes, edges } = makeValidLinearWorkflow();
      const orphan = makeMessageNode('orphan');

      const result = validateWorkflow({ nodes: [...nodes, orphan], edges });

      const expectedErrors = result.issues.filter((i) => i.severity === 'error').length;
      const expectedWarnings = result.issues.filter((i) => i.severity === 'warning').length;

      expect(result.errorCount).toBe(expectedErrors);
      expect(result.warningCount).toBe(expectedWarnings);
    });
  });
});
