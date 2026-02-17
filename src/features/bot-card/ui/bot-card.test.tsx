import { render, screen } from '@testing-library/react';
import { BotCard } from './bot-card';
import { vi, Mock } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useTranslations } from 'next-intl';

describe('BotCard', () => {
  beforeEach(() => {
    (useTranslations as Mock).mockReturnValue((key: string) => {
      const dictionary: Record<string, string> = {
        active: 'Active',
        draft: 'Draft',
        lastUpdated: 'Last updated',
        edit: 'Edit',
        delete: 'Delete',
      };

      return dictionary[key] ?? key;
    });
  });

  test('renders bot details and edit link for active bot', () => {
    render(
      <BotCard
        id="bot-1"
        name="Support Bot"
        status="active"
        lastUpdated="02/17/2026"
        description="Answers FAQs"
      />
    );

    expect(screen.getByText('Support Bot')).toBeInTheDocument();
    expect(screen.getByText('Answers FAQs')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Last updated 02/17/2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/editor/bot-1');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  test('shows draft label when status is not active', () => {
    render(<BotCard id="bot-2" name="Draft Bot" lastUpdated="02/17/2026" description={null} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});
