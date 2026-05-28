import { workflowRepository } from './repository';
import { workflowSchema } from '../model/validation';
import type { AppNode, AppEdge } from '../model/types';
import type { Flow } from '@prisma/client';

export const workflowService = {
  async getWorkflowByBotId(botId: string): Promise<Flow | null> {
    if (!botId) {
      throw new Error('botId is required');
    }
    return workflowRepository.getByBotId(botId);
  },

  async saveWorkflow(botId: string, nodes: AppNode[], edges: AppEdge[]): Promise<Flow> {
    const parsed = workflowSchema.safeParse({ botId, nodes, edges });

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((item) => item.message).join(', '));
    }

    return workflowRepository.upsertByBotId(
      parsed.data.botId,
      parsed.data.nodes,
      parsed.data.edges
    );
  },
};
