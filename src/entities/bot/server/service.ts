import { botRepository } from './repository';

export const botService = {
  async getAllBots() {
    // здесь будет проверка авторизации
    return await botRepository.findAll();
  },

  async createBot(name: string) {
    if (name.length < 3) throw new Error('Имя бота слишком короткое');

    // заглушка для userId, пока нет авторизации
    const userId = 'temp-user-id';

    return await botRepository.create({ name, userId });
  },
};
