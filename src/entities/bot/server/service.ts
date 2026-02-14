import { botRepository } from './repository';

export const botService = {
  async getAllBots(userId: string) {
    return await botRepository.findAllByUserId(userId);
  },

  async createNewBot(data: { name: string; description?: string; userId: string }) {
    if (data.name.length < 3) {
      throw new Error('Bot name is too short (minimum 3 characters)');
    }

    return await botRepository.create(data);
  },
};
