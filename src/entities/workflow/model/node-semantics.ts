import type { WorkflowNodeType } from './types';

export interface NodeSemantics {
  /**
   * True when executing the node stops the workflow until the end user responds.
   * Cycles are only safe when they pass through at least one such node.
   */
  waitsForInput: boolean;
  /**
   * Shape of the node's source outputs on the canvas:
   * - 'single': one unnamed output (edge `sourceHandle` is null/undefined);
   * - 'perHandle': one named output per handle (choice buttons, condition branches);
   * - 'none': no outputs, the node terminates the dialog.
   * Every output may have at most one outgoing edge.
   */
  outputs: 'single' | 'perHandle' | 'none';
}

/**
 * Behavioural (non-presentational) properties of each node type, shared by
 * the runtime engine, graph validation and the canvas.
 * Exhaustive by design: adding a node type forces an explicit decision here.
 */
export const WORKFLOW_NODE_SEMANTICS: Record<WorkflowNodeType, NodeSemantics> = {
  start: { waitsForInput: false, outputs: 'single' },
  message: { waitsForInput: false, outputs: 'single' },
  question: { waitsForInput: true, outputs: 'single' },
  choice: { waitsForInput: true, outputs: 'perHandle' },
  condition: { waitsForInput: false, outputs: 'perHandle' },
  summary: { waitsForInput: false, outputs: 'single' },
  end: { waitsForInput: false, outputs: 'none' },
};

export function isWaitingNodeType(type: string | undefined): boolean {
  if (!type || !(type in WORKFLOW_NODE_SEMANTICS)) {
    return false;
  }

  return WORKFLOW_NODE_SEMANTICS[type as WorkflowNodeType].waitsForInput;
}
