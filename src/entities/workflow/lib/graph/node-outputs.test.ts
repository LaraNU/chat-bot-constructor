import { describe, expect, it } from 'vitest';

import type { AppEdge } from '../../model/types';

import { groupEdgesByOutput, isOutputOccupied } from './node-outputs';

function edge(id: string, source: string, target: string, sourceHandle?: string | null): AppEdge {
  return { id, source, target, sourceHandle };
}

describe('groupEdgesByOutput', () => {
  it('treats null and undefined sourceHandle as the same output', () => {
    const edges = [edge('e1', 'msg-1', 'a', null), edge('e2', 'msg-1', 'b')];

    const outputs = groupEdgesByOutput(edges);

    expect(outputs).toHaveLength(1);
    expect(outputs[0]).toMatchObject({ source: 'msg-1', sourceHandle: null });
    expect(outputs[0].edges.map((e) => e.id)).toEqual(['e1', 'e2']);
  });

  it('treats different choice buttons as different outputs', () => {
    const edges = [edge('e1', 'choice-1', 'a', 'btn-a'), edge('e2', 'choice-1', 'b', 'btn-b')];

    expect(groupEdgesByOutput(edges)).toHaveLength(2);
  });

  it('treats condition true and false branches as different outputs', () => {
    const edges = [edge('e1', 'cond-1', 'a', 'true'), edge('e2', 'cond-1', 'b', 'false')];

    expect(groupEdgesByOutput(edges)).toHaveLength(2);
  });

  it('treats the same handle id on different nodes as different outputs', () => {
    const edges = [edge('e1', 'msg-1', 'a'), edge('e2', 'msg-2', 'b')];

    expect(groupEdgesByOutput(edges)).toHaveLength(2);
  });
});

describe('isOutputOccupied', () => {
  it('returns false for an output without edges', () => {
    expect(isOutputOccupied([], { source: 'msg-1', sourceHandle: null })).toBe(false);
  });

  it('returns true for an output that already has an edge', () => {
    const edges = [edge('e1', 'msg-1', 'a')];

    expect(isOutputOccupied(edges, { source: 'msg-1', sourceHandle: null })).toBe(true);
  });

  it('normalizes null and undefined sourceHandle', () => {
    const edges = [edge('e1', 'msg-1', 'a', null)];

    expect(isOutputOccupied(edges, { source: 'msg-1' })).toBe(true);
  });

  it('ignores edges from other outputs of the same node', () => {
    const edges = [edge('e1', 'cond-1', 'a', 'true'), edge('e2', 'choice-1', 'b', 'btn-a')];

    expect(isOutputOccupied(edges, { source: 'cond-1', sourceHandle: 'false' })).toBe(false);
    expect(isOutputOccupied(edges, { source: 'choice-1', sourceHandle: 'btn-b' })).toBe(false);
  });

  it('ignores edges from other nodes', () => {
    const edges = [edge('e1', 'msg-2', 'a')];

    expect(isOutputOccupied(edges, { source: 'msg-1', sourceHandle: null })).toBe(false);
  });
});
