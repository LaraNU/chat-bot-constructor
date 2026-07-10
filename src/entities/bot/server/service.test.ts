import { botRepository } from './repository';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import { botService } from './service';
import { createClient } from '@/shared/lib/supabase/server';

vi.mock('@/shared/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('./repository', () => ({
  botRepository: {
    create: vi.fn(),
    findAllByUserId: vi.fn(),
  },
}));

describe('botService', () => {
  const mockUserId = 'temp-user-id';

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>;

    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient);
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

      vi.mocked(botRepository.findAllByUserId).mockResolvedValue([
        { ...mockCreatedBot, token: null },
      ]);

      const result = await botService.getAllBots(mockUserId);

      expect(botRepository.findAllByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual([{ ...mockCreatedBot, token: null }]);
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
        token: null as string | null,
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
        'Bot name must be at least 3 characters'
      );

      expect(botRepository.create).not.toHaveBeenCalled();
    });
  });
});
