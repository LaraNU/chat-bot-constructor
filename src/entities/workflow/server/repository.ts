import { prisma } from '@/shared/lib/prisma';
import type { Flow } from '@prisma/client';

export const workflowRepository = {
  async getByBotId(botId: string): Promise<Flow | null> {
    return prisma.flow.findUnique({
      where: { botId },
    });
  },

  async upsertByBotId(botId: string, nodes: Flow['nodes'], edges: Flow['edges']): Promise<Flow> {
    return prisma.flow.upsert({
      where: { botId },
      update: {
        nodes,
        edges,
      },
      create: {
        botId,
        nodes,
        edges,
      },
    });
  },
};
