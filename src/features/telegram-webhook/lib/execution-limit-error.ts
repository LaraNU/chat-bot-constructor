export type WorkflowExecutionLimitReason = 'cycle' | 'step_limit';

/**
 * Thrown by the engine when a single Telegram update would execute the
 * workflow without bound: a non-waiting node is reached twice (`cycle`) or the
 * per-update step limit is exceeded (`step_limit`).
 */
export class WorkflowExecutionLimitError extends Error {
  readonly reason: WorkflowExecutionLimitReason;
  readonly botId: string;
  readonly nodeId: string;

  constructor(reason: WorkflowExecutionLimitReason, botId: string, nodeId: string) {
    super(`Workflow execution stopped (${reason}) for bot "${botId}" at node "${nodeId}"`);

    this.name = 'WorkflowExecutionLimitError';
    this.reason = reason;
    this.botId = botId;
    this.nodeId = nodeId;
  }
}
