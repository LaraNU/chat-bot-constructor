import { workflowRepository } from './repository';
import { draftWorkflowSchema } from '../model/validation';
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
    // Draft save uses a loose schema — node data may be empty (work-in-progress).
    // Strict content validation (non-empty fields) is enforced at publish time only.
    const parsed = draftWorkflowSchema.safeParse({ botId, nodes, edges });

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((item) => item.message).join(', '));
    }

    // The draft schema validates structure but does not transform data,
    // so the original typed args are safe to pass directly to the repository.
    return workflowRepository.upsertByBotId(parsed.data.botId, nodes, edges);
  },
};
