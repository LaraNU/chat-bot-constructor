import { botRepository } from './repository';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import { botService } from './service';

vi.mock('./repository', () => ({
  botRepository: {
    create: vi.fn(),
    findAll: vi.fn(),
  },
}));

describe('botService', () => {
  const mockUserId = 'temp-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNewBot', () => {
    test('should give all bots', async () => {
      const newBot = {
        name: 'New Bot',
        description: 'New Bot description',
        userId: mockUserId,
      };

      const mockCreatedBot = {
        ...newBot,
        id: 'uuid-1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(botRepository.findAll).mockResolvedValue([mockCreatedBot]);

      const result = await botService.getAllBots();

      expect(botRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCreatedBot]);
    });

    test('should create a bot with valid data', async () => {
      const newBot = {
        name: 'New Bot',
        description: 'New Bot description',
        userId: mockUserId,
      };

      const mockCreatedBot = {
        ...newBot,
        id: 'uuid-1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(botRepository.create).mockResolvedValue(mockCreatedBot);

      const result = await botService.createNewBot(newBot);

      expect(botRepository.create).toHaveBeenCalledWith(newBot);
      expect(result).toEqual(mockCreatedBot);
    });

    test('should throw an error if the name is too short', async () => {
      const invalidBot = {
        name: 'sh',
        description: 'Valid description',
        userId: mockUserId,
      };

      await expect(botService.createNewBot(invalidBot)).rejects.toThrow(
        'Имя бота слишком короткое (минимум 3 символа)'
      );

      expect(botRepository.create).not.toHaveBeenCalled();
    });
  });
});
