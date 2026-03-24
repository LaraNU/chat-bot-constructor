import { prisma } from '@/shared/lib/prisma';
import type { Flow } from '@prisma/client';
import type { PrismaJsonArray } from '../model/types';

export const workflowRepository = {
  async getByBotId(botId: string): Promise<Flow | null> {
    return prisma.flow.findUnique({
      where: { botId },
    });
  },

  async upsertByBotId(
    botId: string,
    nodes: PrismaJsonArray,
    edges: PrismaJsonArray
  ): Promise<Flow> {
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
