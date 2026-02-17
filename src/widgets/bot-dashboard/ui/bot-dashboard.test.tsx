import { render, screen } from '@testing-library/react';
import { vi, Mock } from 'vitest';
import { BotDashboard } from './bot-dashboard';
import { useTranslations } from 'next-intl';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/features/create-bot', () => ({
  CreateBotModal: () => <div data-testid="create-bot-modal" />,
}));

vi.mock('@/widgets/bot-list', () => ({
  BotList: () => <div data-testid="bot-list" />,
  BotListFallback: () => <div data-testid="bot-list-fallback" />,
}));

describe('BotDashboard', () => {
  test('renders translated header and child widgets', () => {
    (useTranslations as Mock).mockReturnValue((key: string) => {
      const dictionary: Record<string, string> = {
        title: 'Dashboard title',
        description: 'Dashboard description',
      };

      return dictionary[key] ?? key;
    });

    render(<BotDashboard />);

    expect(screen.getByTestId('title-for-auth')).toHaveTextContent('Dashboard title');
    expect(screen.getByText('Dashboard description')).toBeInTheDocument();
    expect(screen.getByTestId('create-bot-modal')).toBeInTheDocument();
    expect(screen.getByTestId('bot-list')).toBeInTheDocument();
  });
});
