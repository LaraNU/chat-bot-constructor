import { botRepository } from './repository';
import { createBotSchema } from '../model/types';
import type { Bot } from '../model/types';

export const botService = {
  async getAllBots(userId: string) {
    return await botRepository.findAllByUserId(userId);
  },

  async getPaginatedBots(userId: string, limit: number, offset: number): Promise<Bot[]> {
    return await botRepository.findPaginatedByUserId(userId, limit, offset);
  },

  async createNewBot(data: { name: string; description?: string; userId: string }) {
    const parsed = createBotSchema.safeParse({ name: data.name, description: data.description });

    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((item) => item.message).join(', '));
    }

    return await botRepository.create(data);
  },
};
