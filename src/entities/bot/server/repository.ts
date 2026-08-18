import { prisma } from '@/shared/lib/prisma';
import type { Bot } from '@prisma/client';
import { createDefaultFlow } from '@/entities/workflow/model';

export type BotWithPublishInfo = Bot & {
  flow: {
    updatedAt: Date;
    snapshot: { updatedAt: Date } | null;
  } | null;
};

export const botRepository = {
  async findAllByUserId(userId: string): Promise<Bot[]> {
    return prisma.bot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string): Promise<Bot | null> {
    return prisma.bot.findUnique({
      where: { id },
    });
  },

  async findPaginatedByUserId(
    userId: string,
    limit: number,
    offset: number
  ): Promise<BotWithPublishInfo[]> {
    return prisma.bot.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      // Activity = last workflow edit; every bot has a flow from create.
      orderBy: { flow: { updatedAt: 'desc' } },
      include: {
        flow: {
          select: {
            updatedAt: true,
            snapshot: { select: { updatedAt: true } },
          },
        },
      },
    });
  },

  async create(data: { name: string; description?: string; userId: string }): Promise<Bot> {
    return prisma.$transaction(async (tx) => {
      const bot = await tx.bot.create({
        data: {
          name: data.name,
          userId: data.userId,
          description: data.description,
        },
      });

      const flow = createDefaultFlow();

      await tx.flow.create({
        data: {
          botId: bot.id,
          nodes: flow.nodes,
          edges: flow.edges,
        },
      });

      return bot;
    });
  },

  async delete(id: string): Promise<Bot> {
    return await prisma.$transaction(async (tx) => {
      await tx.flow.deleteMany({
        where: { botId: id },
      });

      const bot = await tx.bot.delete({
        where: { id },
      });

      return bot;
    });
  },
};
