import { workflowRepository } from './repository';
import { workflowSchema } from '../model/types';
import type { PrismaJsonArray } from '../model/types';

export const workflowService = {
  async getWorkflowByBotId(botId: string) {
    if (!botId) {
      throw new Error('botId is required');
    }

    return workflowRepository.getByBotId(botId);
  },

  async saveWorkflow(botId: string, nodes: PrismaJsonArray, edges: PrismaJsonArray) {
    const parsed = workflowSchema.safeParse({ botId, nodes, edges });
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((item) => item.message).join(', '));
    }

    return workflowRepository.upsertByBotId(botId, nodes, edges);
  },
};
