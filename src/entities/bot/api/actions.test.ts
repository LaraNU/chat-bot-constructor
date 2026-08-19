import { vi, beforeEach, describe, test, expect } from 'vitest';
import { deleteBotAction } from './actions';
import { botService } from '../server/service';
import { createClient } from '@/shared/lib/supabase/server';
import { NotFoundError, TooManyRequestsError } from '@/shared/api/errors';
import { assertMutationRateLimit } from '@/shared/lib/rate-limit';

vi.mock('@/shared/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('../server/service', () => ({
  botService: {
    assertBotOwnership: vi.fn(),
    deleteBot: vi.fn(),
  },
}));

vi.mock('@/shared/lib/rate-limit', () => ({
  assertMutationRateLimit: vi.fn(),
}));

vi.mock('@/shared/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('../server/service', () => ({
  botService: {
    assertBotOwnership: vi.fn(),
    deleteBot: vi.fn(),
  },
}));

describe('deleteBotAction', () => {
  const mockUserId = 'temp-user-id';
  const mockBotId = 'bot-uuid-1234';

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
  });

  test('should return Unauthorized and not touch the bot when there is no user', async () => {
    mockAuthenticatedUser(null);

    const result = await deleteBotAction(mockBotId);

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(assertMutationRateLimit).not.toHaveBeenCalled();
    expect(botService.assertBotOwnership).not.toHaveBeenCalled();
    expect(botService.deleteBot).not.toHaveBeenCalled();
  });

  test('should delete the bot when the requesting user owns it', async () => {
    mockAuthenticatedUser(mockUserId);
    vi.mocked(botService.assertBotOwnership).mockResolvedValue({
      id: mockBotId,
      userId: mockUserId,
      name: 'Owned Bot',
      description: null,
      token: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await deleteBotAction(mockBotId);

    expect(botService.assertBotOwnership).toHaveBeenCalledWith(mockUserId, mockBotId);
    expect(botService.deleteBot).toHaveBeenCalledWith(mockBotId);
    expect(result).toEqual({ success: true });
  });

  test('should fail without deleting when the bot belongs to another user', async () => {
    mockAuthenticatedUser(mockUserId);
    vi.mocked(botService.assertBotOwnership).mockRejectedValue(new NotFoundError('Bot not found'));

    const result = await deleteBotAction(mockBotId);

    expect(botService.assertBotOwnership).toHaveBeenCalledWith(mockUserId, mockBotId);
    expect(botService.deleteBot).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: 'Bot not found' });
  });

  test('should reject without deleting when the user is rate limited', async () => {
    mockAuthenticatedUser(mockUserId);
    vi.mocked(assertMutationRateLimit).mockImplementation(() => {
      throw new TooManyRequestsError('Too many requests', 12);
    });

    const result = await deleteBotAction(mockBotId);

    expect(assertMutationRateLimit).toHaveBeenCalledWith(mockUserId);
    expect(result).toEqual({ success: false, error: 'Too many requests' });
    expect(botService.assertBotOwnership).not.toHaveBeenCalled();
    expect(botService.deleteBot).not.toHaveBeenCalled();
  });
});
