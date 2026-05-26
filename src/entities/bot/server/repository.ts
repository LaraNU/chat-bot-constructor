import { prisma } from '@/shared/lib/prisma';
import type { Bot } from '@prisma/client';
import type { AppNode, AppEdge } from '@/entities/workflow/model/types';

export const botRepository = {
  async findAllByUserId(userId: string): Promise<Bot[]> {
    return prisma.bot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findPaginatedByUserId(userId: string, limit: number, offset: number): Promise<Bot[]> {
    return prisma.bot.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: { name: string; description?: string; userId: string }): Promise<Bot> {
    return await prisma.$transaction(async (tx) => {
      const bot = await tx.bot.create({
        data: {
          name: data.name,
          userId: data.userId,
          description: data.description,
        },
      });

      await tx.flow.create({
        data: {
          botId: bot.id,
          nodes: [] as AppNode[],
          edges: [] as AppEdge[],
        },
      });

      return bot;
    });
  },
};
