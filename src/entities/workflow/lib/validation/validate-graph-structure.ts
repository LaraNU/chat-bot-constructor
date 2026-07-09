import type { AppEdge, AppNode } from '../../model/types';

import type { ValidationIssue } from './types';

/**
 * BFS from the start node following directed edges.
 * Returns the set of node ids reachable from start.
 * Returns an empty set when no start node exists.
 */
function findReachableNodeIds(nodes: AppNode[], edges: AppEdge[]): Set<string> {
  const startNode = nodes.find((n) => n.type === 'start');

  if (!startNode) {
    return new Set();
  }

  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    const targets = adjacency.get(edge.source) ?? [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  }

  const visited = new Set<string>();
  const queue: string[] = [startNode.id];

  while (queue.length > 0) {
    const nodeId = queue.pop()!;

    if (visited.has(nodeId)) {
      continue;
    }

    visited.add(nodeId);

    const neighbors = adjacency.get(nodeId) ?? [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

/**
 * Validates overall graph topology:
 * - start node existence and uniqueness
 * - end node existence
 * - start node connectivity
 * - node reachability from start
 */
export function validateGraphStructure(nodes: AppNode[], edges: AppEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes = nodes.filter((n) => n.type === 'end');

  if (startNodes.length === 0) {
    issues.push({
      severity: 'error',
      code: 'NO_START_NODE',
      messageKey: 'validation.noStartNode',
    });
  } else if (startNodes.length > 1) {
    issues.push({
      severity: 'error',
      code: 'MULTIPLE_START_NODES',
      messageKey: 'validation.multipleStartNodes',
      messageParams: { count: String(startNodes.length) },
    });
  } else {
    const startNode = startNodes[0];
    const startHasOutgoingEdge = edges.some((e) => e.source === startNode.id);

    if (!startHasOutgoingEdge) {
      issues.push({
        severity: 'error',
        code: 'START_NODE_NOT_CONNECTED',
        nodeId: startNode.id,
        messageKey: 'validation.startNodeNotConnected',
      });
    }
  }

  if (endNodes.length === 0) {
    issues.push({
      severity: 'error',
      code: 'NO_END_NODE',
      messageKey: 'validation.noEndNode',
    });
  }

  // Reachability check only makes sense when there is exactly one start node.
  if (startNodes.length === 1) {
    const reachable = findReachableNodeIds(nodes, edges);

    for (const node of nodes) {
      if (!reachable.has(node.id)) {
        issues.push({
          severity: 'warning',
          code: 'UNREACHABLE_NODE',
          nodeId: node.id,
          messageKey: 'validation.unreachableNode',
        });
      }
    }
  }

  return issues;
}
