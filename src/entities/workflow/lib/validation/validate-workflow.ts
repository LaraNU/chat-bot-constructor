import type { ValidationResult, WorkflowGraph } from './types';

import { validateGraphStructure } from './validate-graph-structure';
import { validateNodeConnections } from './validate-node-connections';
import { validateNodeData } from './validate-node-data';

/**
 * Main validation entry point.
 *
 * Runs the three validation phases in sequence and aggregates all issues:
 * 1. validateGraphStructure  — topology: start/end nodes, connectivity, reachability
 * 2. validateNodeConnections — required edges per node type (condition branches, choice buttons)
 * 3. validateNodeData        — per-node data integrity via the node validator registry
 *
 * Pure function: no React, no Zustand, no I/O.
 */
export function validateWorkflow({ nodes, edges }: WorkflowGraph): ValidationResult {
  const issues = [
    ...validateGraphStructure(nodes, edges),
    ...validateNodeConnections(nodes, edges),
    ...validateNodeData(nodes, edges),
  ];

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    isValid: errorCount === 0,
    issues,
    errorCount,
    warningCount,
  };
}
