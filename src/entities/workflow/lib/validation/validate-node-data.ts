import type { AppEdge, AppNode, WorkflowNodeType } from '../../model/types';

import type { ValidationIssue } from './types';
import { NODE_DATA_VALIDATORS } from './node-validators/registry';

/**
 * Runs the per-node data validator for each node in the graph.
 *
 * Nodes whose type has no registered validator are silently skipped —
 * adding a validator for a new type only requires updating the registry.
 */
export function validateNodeData(nodes: AppNode[], edges: AppEdge[]): ValidationIssue[] {
  return nodes.flatMap((node) => {
    const validator = NODE_DATA_VALIDATORS[node.type as WorkflowNodeType];
    return validator ? validator(node, nodes, edges) : [];
  });
}
