import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, expect, test, Mock } from 'vitest';
import { BotList } from './bot-list';
import { createClient } from '@/shared/lib/supabase/server';
import { botService } from '@/entities/bot/server/service';
import { InfiniteBotList } from '@/entities/bot/ui/infinite-bot-list';
import { BOTS_PER_PAGE } from '@/entities/bot';

type initialBotsMock = {
  name: string;
  description: string | null;
  id: string;
  userId: string;
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
  flow: { updatedAt: Date; snapshot: { updatedAt: Date } | null } | null;
};

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  getFormatter: vi.fn().mockResolvedValue({
    dateTime: vi.fn(() => '17.02.2026'),
  }),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
  useFormatter: vi.fn(() => ({
    dateTime: vi.fn(() => '17.02.2026'),
  })),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => '/'),
}));

vi.mock('@/shared/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/entities/bot/server/service', () => ({
  botService: {
    getPaginatedBots: vi.fn(),
  },
}));

vi.mock('@/entities/bot/ui/infinite-bot-list', () => ({
  InfiniteBotList: vi.fn(({ initialBots }: { initialBots: initialBotsMock[] }) => (
    <div data-testid="infinite-bot-list">
      {initialBots.map((bot) => (
        <div key={bot.id} data-testid="mock-bot-item">
          {bot.name}
        </div>
      ))}
    </div>
  )),
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
    expect(botService.getPaginatedBots).not.toHaveBeenCalled();
  });

  test('loads user bots and renders InfiniteBotList with correct payload', async () => {
    (createClient as Mock).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    });

    (botService.getPaginatedBots as Mock).mockResolvedValue([
      {
        id: 'bot-1',
        name: 'Bot One',
        description: 'First bot',
        token: null,
        userId: 'user-1',
        createdAt: new Date('2026-02-17T00:00:00.000Z'),
        updatedAt: new Date('2026-02-17T00:00:00.000Z'),
        flow: null,
      },
      {
        id: 'bot-2',
        name: 'Bot Two',
        description: null,
        token: 'live-token',
        userId: 'user-1',
        createdAt: new Date('2026-02-16T00:00:00.000Z'),
        // Bot.updatedAt lags behind flow edits — card must use flow.updatedAt
        updatedAt: new Date('2026-02-16T00:00:00.000Z'),
        flow: {
          updatedAt: new Date('2026-02-18T00:00:00.000Z'),
          snapshot: { updatedAt: new Date('2026-02-18T00:00:00.000Z') },
        },
      },
    ]);

    const ui = await BotList();
    render(ui);

    expect(botService.getPaginatedBots).toHaveBeenCalledWith('user-1', BOTS_PER_PAGE, 0);
    expect(screen.getAllByTestId('mock-bot-item')).toHaveLength(2);

    expect(InfiniteBotList).toHaveBeenCalledWith(
      expect.objectContaining({
        initialBots: [
          {
            id: 'bot-1',
            status: 'draft',
            name: 'Bot One',
            description: 'First bot',
            updatedAt: '2026-02-17T00:00:00.000Z',
          },
          {
            id: 'bot-2',
            status: 'published',
            name: 'Bot Two',
            description: null,
            updatedAt: '2026-02-18T00:00:00.000Z',
          },
        ],
        limit: BOTS_PER_PAGE,
      }),
      undefined
    );
  });
});
