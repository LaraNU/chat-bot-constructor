import { botRepository, type BotWithPublishInfo } from './repository';
import { createBotSchema } from '../model/types';
import type { Bot } from '@prisma/client';

export const botService = {
  async getAllBots(userId: string) {
    return await botRepository.findAllByUserId(userId);
  },

  async getBotById(id: string): Promise<Bot | null> {
    if (!id) {
      throw new Error('Bot ID is required');
    }
    return await botRepository.findById(id);
  },

  async getPaginatedBots(
    userId: string,
    limit: number,
    offset: number
  ): Promise<BotWithPublishInfo[]> {
    return await botRepository.findPaginatedByUserId(userId, limit, offset);
  },

  async createNewBot(data: { name: string; description?: string; userId: string }) {
    const parsed = createBotSchema.safeParse({ name: data.name, description: data.description });

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((item) => item.message).join(', '));
    }

    return await botRepository.create(data);
  },

  async deleteBot(id: string): Promise<Bot> {
    if (!id) {
      throw new Error('Bot ID is required');
    }
    return await botRepository.delete(id);
  },
};
