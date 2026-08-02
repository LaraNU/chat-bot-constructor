import { botRepository } from './repository';
import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest';
import { botService } from './service';
import { createClient } from '@/shared/lib/supabase/server';
import { NotFoundError } from '@/shared/api/errors';
import type { Bot } from '@prisma/client';

vi.mock('@/shared/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('./repository', () => ({
  botRepository: {
    create: vi.fn(),
    findAllByUserId: vi.fn(),
    findById: vi.fn(),
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

  describe('assertBotOwnership', () => {
    const mockBotId = 'bot-uuid-1234';

    const mockBot: Bot = {
      id: mockBotId,
      name: 'Owned Bot',
      description: null,
      userId: mockUserId,
      token: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    test('should return the bot when it belongs to the requesting user', async () => {
      vi.mocked(botRepository.findById).mockResolvedValue(mockBot);

      const result = await botService.assertBotOwnership(mockUserId, mockBotId);

      expect(botRepository.findById).toHaveBeenCalledWith(mockBotId);
      expect(result).toEqual(mockBot);
    });

    test('should throw NotFoundError when the bot belongs to another user', async () => {
      vi.mocked(botRepository.findById).mockResolvedValue({
        ...mockBot,
        userId: 'another-user-id',
      });

      await expect(botService.assertBotOwnership(mockUserId, mockBotId)).rejects.toThrow(
        NotFoundError
      );
    });

    test('should throw NotFoundError when the bot does not exist', async () => {
      vi.mocked(botRepository.findById).mockResolvedValue(null);

      await expect(botService.assertBotOwnership(mockUserId, mockBotId)).rejects.toThrow(
        NotFoundError
      );
    });

    test('should not leak whether the bot is missing or owned by someone else', async () => {
      vi.mocked(botRepository.findById).mockResolvedValue(null);
      const notFoundMessage = await botService
        .assertBotOwnership(mockUserId, mockBotId)
        .catch((error: Error) => error.message);

      vi.mocked(botRepository.findById).mockResolvedValue({
        ...mockBot,
        userId: 'another-user-id',
      });
      const otherOwnerMessage = await botService
        .assertBotOwnership(mockUserId, mockBotId)
        .catch((error: Error) => error.message);

      expect(notFoundMessage).toBe(otherOwnerMessage);
    });
  });

  describe('getBotById', () => {
    const mockBotId = 'bot-uuid-1234';

    const mockBot: Bot = {
      id: mockBotId,
      name: 'Some Bot',
      description: null,
      userId: mockUserId,
      token: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    test('should return the bot regardless of who owns it', async () => {
      vi.mocked(botRepository.findById).mockResolvedValue({
        ...mockBot,
        userId: 'another-user-id',
      });

      const result = await botService.getBotById(mockBotId);

      expect(botRepository.findById).toHaveBeenCalledWith(mockBotId);
      expect(result).toEqual({ ...mockBot, userId: 'another-user-id' });
    });

    test('should return null when the bot does not exist', async () => {
      vi.mocked(botRepository.findById).mockResolvedValue(null);

      const result = await botService.getBotById(mockBotId);

      expect(result).toBeNull();
    });
  });

  describe('getWebhookSecret', () => {
    const mockBotId = 'bot-uuid-1234';

    beforeEach(() => {
      vi.stubEnv('TELEGRAM_WEBHOOK_SECRET_KEY', 'server-only-secret-key');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    test('should deterministically derive the same secret for the same botId', () => {
      const first = botService.getWebhookSecret(mockBotId);
      const second = botService.getWebhookSecret(mockBotId);

      expect(first).toBe(second);
    });

    test('should derive a different secret for a different botId', () => {
      const secretA = botService.getWebhookSecret('bot-a');
      const secretB = botService.getWebhookSecret('bot-b');

      expect(secretA).not.toBe(secretB);
    });

    test('should throw when TELEGRAM_WEBHOOK_SECRET_KEY is not configured', () => {
      vi.stubEnv('TELEGRAM_WEBHOOK_SECRET_KEY', '');

      expect(() => botService.getWebhookSecret(mockBotId)).toThrow(
        'TELEGRAM_WEBHOOK_SECRET_KEY environment variable is not set'
      );
    });
  });

  describe('verifyWebhookSecret', () => {
    const mockBotId = 'bot-uuid-1234';

    beforeEach(() => {
      vi.stubEnv('TELEGRAM_WEBHOOK_SECRET_KEY', 'server-only-secret-key');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    test('should return true when the provided secret matches the expected one', () => {
      const expected = botService.getWebhookSecret(mockBotId);

      expect(botService.verifyWebhookSecret(mockBotId, expected)).toBe(true);
    });

    test('should return false when the provided secret is wrong', () => {
      expect(botService.verifyWebhookSecret(mockBotId, 'not-the-right-secret')).toBe(false);
    });

    test('should return false when the header is missing', () => {
      expect(botService.verifyWebhookSecret(mockBotId, null)).toBe(false);
    });

    test('should return false for a secret computed for a different botId', () => {
      const secretForAnotherBot = botService.getWebhookSecret('another-bot-id');

      expect(botService.verifyWebhookSecret(mockBotId, secretForAnotherBot)).toBe(false);
    });
  });
});
