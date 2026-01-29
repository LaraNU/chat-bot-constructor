import { prisma } from '@/shared/lib/prisma';
import type { Bot } from '@prisma/client';

export const botRepository = {
  async findAll(): Promise<Bot[]> {
    return prisma.bot.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: { name: string; userId: string }): Promise<Bot> {
    return prisma.bot.create({ data });
  },
};
