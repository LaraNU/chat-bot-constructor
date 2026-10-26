import type { AppEdge, AppNode } from '../../model/types';
import { findNodesInUnsafeCycles } from '../graph';

import type { ValidationIssue } from './types';

/**
 * Validates that every cycle passes through at least one node that waits for
 * user input (question, choice). Without one, the runtime would execute the
 * cycle forever within a single Telegram update.
 *
 * Reports one error per node in such a cycle so the canvas can highlight each.
 */
export function validateCycles(nodes: AppNode[], edges: AppEdge[]): ValidationIssue[] {
  return [...findNodesInUnsafeCycles(nodes, edges)].map((nodeId) => ({
    severity: 'error',
    code: 'CYCLE_WITHOUT_WAITING_NODE',
    nodeId,
    messageKey: 'validation.cycleWithoutWaitingNode',
  }));
}
