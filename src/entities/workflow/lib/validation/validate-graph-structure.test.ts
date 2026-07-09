import { describe, expect, it } from 'vitest';

import { validateGraphStructure } from './validate-graph-structure';
import {
  makeEdge,
  makeEndNode,
  makeMessageNode,
  makeStartNode,
  makeValidLinearWorkflow,
} from './test-utils/fixtures';

describe('validateGraphStructure', () => {
  describe('start node', () => {
    it('emits NO_START_NODE error when nodes list is empty', () => {
      const issues = validateGraphStructure([], []);

      expect(issues).toContainEqual(
        expect.objectContaining({ code: 'NO_START_NODE', severity: 'error' })
      );
    });

    it('emits NO_START_NODE error when no start-type node exists', () => {
      const nodes = [makeMessageNode('msg-1'), makeEndNode()];

      const issues = validateGraphStructure(nodes, []);

      expect(issues).toContainEqual(
        expect.objectContaining({ code: 'NO_START_NODE', severity: 'error' })
      );
    });

    it('emits MULTIPLE_START_NODES error when two start nodes are present', () => {
      const nodes = [makeStartNode('start-1'), makeStartNode('start-2'), makeEndNode()];
      const edges = [makeEdge('e1', 'start-1', 'end-1'), makeEdge('e2', 'start-2', 'end-1')];

      const issues = validateGraphStructure(nodes, edges);

      const issue = issues.find((i) => i.code === 'MULTIPLE_START_NODES');
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('error');
      expect(issue?.messageParams?.count).toBe('2');
    });

    it('emits START_NODE_NOT_CONNECTED error when start has no outgoing edge', () => {
      const nodes = [makeStartNode('start-1'), makeEndNode()];

      const issues = validateGraphStructure(nodes, []);

      expect(issues).toContainEqual(
        expect.objectContaining({
          code: 'START_NODE_NOT_CONNECTED',
          severity: 'error',
          nodeId: 'start-1',
        })
      );
    });

    it('does not emit START_NODE_NOT_CONNECTED when start is connected', () => {
      const { nodes, edges } = makeValidLinearWorkflow();

      const issues = validateGraphStructure(nodes, edges);

      expect(issues.map((i) => i.code)).not.toContain('START_NODE_NOT_CONNECTED');
    });
  });

  describe('end node', () => {
    it('emits NO_END_NODE error when no end-type node exists', () => {
      const nodes = [makeStartNode(), makeMessageNode('msg-1')];
      const edges = [makeEdge('e1', 'start-1', 'msg-1')];

      const issues = validateGraphStructure(nodes, edges);

      expect(issues).toContainEqual(
        expect.objectContaining({ code: 'NO_END_NODE', severity: 'error' })
      );
    });

    it('does not emit NO_END_NODE when an end node is present', () => {
      const { nodes, edges } = makeValidLinearWorkflow();

      const issues = validateGraphStructure(nodes, edges);

      expect(issues.map((i) => i.code)).not.toContain('NO_END_NODE');
    });
  });

  describe('node reachability', () => {
    it('emits UNREACHABLE_NODE warning for a node not connected to the graph', () => {
      const { nodes, edges } = makeValidLinearWorkflow();
      const orphan = makeMessageNode('orphan');

      const issues = validateGraphStructure([...nodes, orphan], edges);

      expect(issues).toContainEqual(
        expect.objectContaining({
          code: 'UNREACHABLE_NODE',
          severity: 'warning',
          nodeId: 'orphan',
        })
      );
    });

    it('does not emit UNREACHABLE_NODE for nodes reachable from start', () => {
      const { nodes, edges } = makeValidLinearWorkflow();

      const issues = validateGraphStructure(nodes, edges);

      expect(issues.map((i) => i.code)).not.toContain('UNREACHABLE_NODE');
    });

    it('skips reachability check when there are multiple start nodes', () => {
      const nodes = [makeStartNode('start-1'), makeStartNode('start-2'), makeEndNode('end-1')];
      const edges = [makeEdge('e1', 'start-1', 'end-1'), makeEdge('e2', 'start-2', 'end-1')];

      const issues = validateGraphStructure(nodes, edges);

      // No UNREACHABLE_NODE — check is skipped when start count ≠ 1
      expect(issues.map((i) => i.code)).not.toContain('UNREACHABLE_NODE');
    });

    it('does not treat the start node itself as unreachable', () => {
      const { nodes, edges } = makeValidLinearWorkflow();

      const issues = validateGraphStructure(nodes, edges);

      const unreachableNodes = issues
        .filter((i) => i.code === 'UNREACHABLE_NODE')
        .map((i) => i.nodeId);

      expect(unreachableNodes).not.toContain('start-1');
    });
  });

  describe('valid workflow', () => {
    it('returns no issues for a minimal valid linear workflow', () => {
      const { nodes, edges } = makeValidLinearWorkflow();

      const issues = validateGraphStructure(nodes, edges);

      expect(issues).toHaveLength(0);
    });
  });
});
