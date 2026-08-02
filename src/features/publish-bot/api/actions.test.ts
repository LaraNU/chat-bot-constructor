import { vi, beforeEach, describe, test, expect } from 'vitest';
import { publishBotAction } from './actions';
import { botService } from '@/entities/bot/server';
import { setTelegramWebhook } from '../lib/telegram';
import { createClient } from '@/shared/lib/supabase/server';
import { prisma } from '@/shared/lib/prisma';
import { NotFoundError } from '@/shared/api/errors';
import type { Bot } from '@prisma/client';

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map([['host', 'app.example.com']])),
}));

vi.mock('@/shared/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/entities/bot/server', () => ({
  botService: {
    assertBotOwnership: vi.fn(),
    getWebhookSecret: vi.fn(),
  },
}));

vi.mock('../lib/telegram', () => ({
  setTelegramWebhook: vi.fn(),
}));

vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

describe('publishBotAction', () => {
  const mockUserId = 'temp-user-id';
  const mockBotId = 'bot-uuid-1234';
  const mockToken = '123456:abcDEF-token';

  const mockBot: Bot = {
    id: mockBotId,
    userId: mockUserId,
    name: 'Owned Bot',
    description: null,
    token: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function mockAuthenticatedUser(userId: string | null) {
    const mockSupabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: userId ? { id: userId } : null },
          error: null,
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>;

    vi.mocked(createClient).mockResolvedValue(mockSupabaseClient);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockResolvedValue(undefined);
  });

  test('should reject invalid payload without calling auth, ownership, or Telegram', async () => {
    const result = await publishBotAction({ botId: mockBotId, token: 'not-a-valid-token' });

    expect(result.success).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
    expect(botService.assertBotOwnership).not.toHaveBeenCalled();
    expect(setTelegramWebhook).not.toHaveBeenCalled();
  });

  test('should return Unauthorized and never call Telegram when there is no user', async () => {
    mockAuthenticatedUser(null);

    const result = await publishBotAction({ botId: mockBotId, token: mockToken });

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(botService.assertBotOwnership).not.toHaveBeenCalled();
    expect(setTelegramWebhook).not.toHaveBeenCalled();
  });

  test('should fail without registering the Telegram webhook when the bot belongs to another user', async () => {
    mockAuthenticatedUser(mockUserId);
    vi.mocked(botService.assertBotOwnership).mockRejectedValue(new NotFoundError('Bot not found'));

    const result = await publishBotAction({ botId: mockBotId, token: mockToken });

    expect(botService.assertBotOwnership).toHaveBeenCalledWith(mockUserId, mockBotId);
    expect(result).toEqual({ success: false, error: 'Bot not found' });
    // The whole point of this fix: no Telegram side effect before ownership is confirmed.
    expect(setTelegramWebhook).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test('should verify ownership before calling Telegram, then publish successfully for the owner', async () => {
    mockAuthenticatedUser(mockUserId);
    vi.mocked(botService.assertBotOwnership).mockResolvedValue(mockBot);
    vi.mocked(botService.getWebhookSecret).mockReturnValue('computed-secret-token');
    vi.mocked(setTelegramWebhook).mockResolvedValue(undefined);

    const result = await publishBotAction({ botId: mockBotId, token: mockToken });

    expect(botService.assertBotOwnership).toHaveBeenCalledWith(mockUserId, mockBotId);
    expect(botService.getWebhookSecret).toHaveBeenCalledWith(mockBotId);
    expect(setTelegramWebhook).toHaveBeenCalledWith(
      mockToken,
      mockBotId,
      'https://app.example.com',
      'computed-secret-token'
    );

    const ownershipCallOrder = vi.mocked(botService.assertBotOwnership).mock.invocationCallOrder[0];
    const webhookCallOrder = vi.mocked(setTelegramWebhook).mock.invocationCallOrder[0];
    expect(ownershipCallOrder).toBeLessThan(webhookCallOrder);

    expect(result).toEqual({ success: true });
  });
});
