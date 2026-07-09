import { describe, expect, it } from 'vitest';

import { validateNodeData } from './validate-node-data';
import {
  makeChoiceNode,
  makeConditionNode,
  makeEndNode,
  makeQuestionNode,
  makeStartNode,
  makeSummaryNode,
} from './test-utils/fixtures';
import type { AppEdge, AppNode } from '../../model/types';

const NO_EDGES: AppEdge[] = [];

describe('validateNodeData', () => {
  describe('condition node', () => {
    it('emits CONDITION_INVALID_QUESTION_REF when questionNodeId is empty string', () => {
      const condNode = makeConditionNode('cond-1', {
        questionNodeId: '',
        operator: 'equals',
        value: 'yes',
      });
      const nodes: AppNode[] = [makeStartNode(), condNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      expect(issues).toContainEqual(
        expect.objectContaining({
          code: 'CONDITION_INVALID_QUESTION_REF',
          severity: 'error',
          nodeId: 'cond-1',
        })
      );
    });

    it('emits CONDITION_INVALID_QUESTION_REF when referenced node does not exist', () => {
      const condNode = makeConditionNode('cond-1', {
        questionNodeId: 'non-existent-id',
        operator: 'equals',
        value: 'yes',
      });
      const nodes: AppNode[] = [makeStartNode(), condNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      expect(issues).toContainEqual(
        expect.objectContaining({ code: 'CONDITION_INVALID_QUESTION_REF', nodeId: 'cond-1' })
      );
    });

    it('emits CONDITION_INVALID_QUESTION_REF when referenced node is not a question type', () => {
      const condNode = makeConditionNode('cond-1', { questionNodeId: 'msg-1' });
      const msgNode = { ...makeStartNode('msg-1'), type: 'message' } as AppNode;
      const nodes: AppNode[] = [makeStartNode(), condNode, msgNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      expect(issues).toContainEqual(
        expect.objectContaining({ code: 'CONDITION_INVALID_QUESTION_REF', nodeId: 'cond-1' })
      );
    });

    it('emits no errors when condition references a valid question node', () => {
      const qNode = makeQuestionNode('q-1');
      const condNode = makeConditionNode('cond-1', { questionNodeId: 'q-1' });
      const nodes: AppNode[] = [makeStartNode(), qNode, condNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      expect(issues.map((i) => i.code)).not.toContain('CONDITION_INVALID_QUESTION_REF');
    });
  });

  describe('choice node', () => {
    it('emits CHOICE_NO_BUTTONS when buttons array is empty', () => {
      const choiceNode = makeChoiceNode('choice-1', { text: 'Pick:', buttons: [] });
      const nodes: AppNode[] = [makeStartNode(), choiceNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      expect(issues).toContainEqual(
        expect.objectContaining({
          code: 'CHOICE_NO_BUTTONS',
          severity: 'error',
          nodeId: 'choice-1',
        })
      );
    });

    it('emits no errors when choice has at least one button', () => {
      const choiceNode = makeChoiceNode('choice-1');
      const nodes: AppNode[] = [makeStartNode(), choiceNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      expect(issues.map((i) => i.code)).not.toContain('CHOICE_NO_BUTTONS');
    });
  });

  describe('summary node', () => {
    it('emits SUMMARY_NO_INCLUDED_QUESTIONS warning when includedQuestionIds is empty', () => {
      const summaryNode = makeSummaryNode('sum-1', { includedQuestionIds: [] });
      const nodes: AppNode[] = [makeStartNode(), summaryNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      expect(issues).toContainEqual(
        expect.objectContaining({
          code: 'SUMMARY_NO_INCLUDED_QUESTIONS',
          severity: 'warning',
          nodeId: 'sum-1',
        })
      );
    });

    it('emits SUMMARY_INVALID_QUESTION_REFS warning when includedQuestionIds contains deleted node ids', () => {
      const summaryNode = makeSummaryNode('sum-1', {
        includedQuestionIds: ['q-deleted', 'q-also-deleted'],
      });
      const nodes: AppNode[] = [makeStartNode(), summaryNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      const issue = issues.find((i) => i.code === 'SUMMARY_INVALID_QUESTION_REFS');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('warning');
      expect(issue?.nodeId).toBe('sum-1');
      expect(issue?.messageParams?.count).toBe('2');
    });

    it('emits no warnings when all includedQuestionIds reference existing nodes', () => {
      const q1 = makeQuestionNode('q-1');
      const summaryNode = makeSummaryNode('sum-1', { includedQuestionIds: ['q-1'] });
      const nodes: AppNode[] = [makeStartNode(), q1, summaryNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      const summaryCodes = issues.filter((i) => i.nodeId === 'sum-1').map((i) => i.code);
      expect(summaryCodes).not.toContain('SUMMARY_NO_INCLUDED_QUESTIONS');
      expect(summaryCodes).not.toContain('SUMMARY_INVALID_QUESTION_REFS');
    });

    it('emits only SUMMARY_INVALID_QUESTION_REFS (not NO_INCLUDED_QUESTIONS) when some ids are stale', () => {
      const q1 = makeQuestionNode('q-1');
      const summaryNode = makeSummaryNode('sum-1', {
        // one valid, one deleted
        includedQuestionIds: ['q-1', 'q-deleted'],
      });
      const nodes: AppNode[] = [makeStartNode(), q1, summaryNode, makeEndNode()];

      const issues = validateNodeData(nodes, NO_EDGES);

      const codes = issues.filter((i) => i.nodeId === 'sum-1').map((i) => i.code);
      expect(codes).toContain('SUMMARY_INVALID_QUESTION_REFS');
      expect(codes).not.toContain('SUMMARY_NO_INCLUDED_QUESTIONS');
    });
  });

  describe('nodes without a registered validator', () => {
    it('returns no issues for start, end, message, and question nodes', () => {
      const nodes: AppNode[] = [
        makeStartNode(),
        makeEndNode(),
        makeQuestionNode('q-1'),
        { id: 'msg-1', type: 'message', position: { x: 0, y: 0 }, data: { text: 'Hi' } } as AppNode,
      ];

      const issues = validateNodeData(nodes, NO_EDGES);

      expect(issues).toHaveLength(0);
    });
  });
});
