import { botRepository, type BotWithPublishInfo } from './repository';
import { createBotSchema } from '../model/types';
import { NotFoundError } from '@/shared/api/errors';
import type { Bot } from '@prisma/client';

export const botService = {
  async getAllBots(userId: string) {
    return await botRepository.findAllByUserId(userId);
  },

  /**
   * Single source of truth for verifying that `botId` belongs to `userId`.
   * Throws the same `NotFoundError` whether the bot does not exist or belongs
   * to a different user, so callers cannot use the response to enumerate
   * other users' bot ids.
   */
  async assertBotOwnership(userId: string, botId: string): Promise<Bot> {
    const bot = await botRepository.findById(botId);

    if (!bot || bot.userId !== userId) {
      throw new NotFoundError('Bot not found');
    }

    return bot;
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
