import { botRepository } from './repository';

export const botService = {
  async getAllBots() {
    // здесь будет проверка авторизации
    return await botRepository.findAll();
  },

  async createNewBot(data: { name: string; description?: string }) {
    if (data.name.length < 3) {
      throw new Error('Имя бота слишком короткое (минимум 3 символа)');
    }

    // заглушка для userId, пока нет авторизации
    const userId = 'temp-user-id';

    return await botRepository.create({
      name: data.name,
      description: data.description,
      userId,
    });
  },
};
