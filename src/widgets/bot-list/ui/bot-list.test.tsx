import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, expect, test, Mock } from 'vitest';
import { BotList } from './bot-list';
import { createClient } from '@/shared/lib/supabase/server';
import { botService } from '@/entities/bot/server/service';
import { BotCard } from '@/features/bot-card';

vi.mock('@/shared/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/entities/bot/server/service', () => ({
  botService: {
    getAllBots: vi.fn(),
  },
}));

vi.mock('@/features/bot-card', () => ({
  BotCard: vi.fn(({ name }: { name: string }) => <div data-testid="bot-card">{name}</div>),
}));

describe('BotList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns null when user is not authenticated', async () => {
    (createClient as Mock).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const result = await BotList();

    expect(result).toBeNull();
    expect(botService.getAllBots).not.toHaveBeenCalled();
  });

  test('loads user bots and renders BotCard for each one', async () => {
    (createClient as Mock).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    });

    (botService.getAllBots as Mock).mockResolvedValue([
      {
        id: 'bot-1',
        name: 'Bot One',
        description: 'First bot',
        updatedAt: new Date('2026-02-17T00:00:00.000Z'),
      },
      {
        id: 'bot-2',
        name: 'Bot Two',
        description: null,
        updatedAt: new Date('2026-02-16T00:00:00.000Z'),
      },
    ]);

    const ui = await BotList();
    render(ui);

    expect(botService.getAllBots).toHaveBeenCalledWith('user-1');
    expect(screen.getAllByTestId('bot-card')).toHaveLength(2);

    expect(BotCard).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bot-1',
        name: 'Bot One',
        description: 'First bot',
        lastUpdated: expect.any(String),
      }),
      undefined
    );

    expect(BotCard).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'bot-2',
        name: 'Bot Two',
        description: null,
        lastUpdated: expect.any(String),
      }),
      undefined
    );
  });
});
