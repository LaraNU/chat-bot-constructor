import type { WorkflowNodeType } from './types';

export interface NodeSemantics {
  /**
   * True when executing the node stops the workflow until the end user responds.
   * Cycles are only safe when they pass through at least one such node.
   */
  waitsForInput: boolean;
}

/**
 * Behavioural (non-presentational) properties of each node type, shared by
 * the runtime engine, graph validation and the canvas.
 * Exhaustive by design: adding a node type forces an explicit decision here.
 */
export const WORKFLOW_NODE_SEMANTICS: Record<WorkflowNodeType, NodeSemantics> = {
  start: { waitsForInput: false },
  message: { waitsForInput: false },
  question: { waitsForInput: true },
  choice: { waitsForInput: true },
  condition: { waitsForInput: false },
  summary: { waitsForInput: false },
  end: { waitsForInput: false },
};

export function isWaitingNodeType(type: string | undefined): boolean {
  if (!type || !(type in WORKFLOW_NODE_SEMANTICS)) {
    return false;
  }

  return WORKFLOW_NODE_SEMANTICS[type as WorkflowNodeType].waitsForInput;
}
