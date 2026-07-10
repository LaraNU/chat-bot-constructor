import { render, screen } from '@testing-library/react';
import { BotCard } from './bot-card';
import { vi, Mock, beforeEach, describe, expect, test } from 'vitest';
import { useTranslations, useFormatter } from 'next-intl';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useFormatter: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('BotCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useTranslations as Mock).mockReturnValue((key: string) => {
      const dictionary: Record<string, string> = {
        active: 'Active',
        draft: 'Draft',
        publishedWithChanges: 'Published · unsaved changes',
        lastUpdated: 'Last updated',
        edit: 'Edit',
        delete: 'Delete',
      };
      return dictionary[key] ?? key;
    });

    (useFormatter as Mock).mockReturnValue({
      dateTime: vi.fn(() => '17.02.2026'),
    });
  });

  test('renders bot details and edit link for published bot', () => {
    render(
      <BotCard
        id="bot-1"
        name="Support Bot"
        status="published"
        updatedAt="2026-02-17T00:00:00.000Z"
        description="Answers FAQs"
      />
    );

    expect(screen.getByText('Support Bot')).toBeInTheDocument();
    expect(screen.getByText('Answers FAQs')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Last updated 17.02.2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', '/editor/bot-1');
  });

  test('shows draft label for draft bots', () => {
    render(
      <BotCard
        id="bot-2"
        status="draft"
        name="Draft Bot"
        updatedAt="2026-02-17T00:00:00.000Z"
        description={null}
      />
    );
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  test('shows published_with_changes badge for bots with unsaved changes', () => {
    render(
      <BotCard
        id="bot-3"
        status="published_with_changes"
        name="Stale Bot"
        updatedAt="2026-02-17T00:00:00.000Z"
        description={null}
      />
    );
    expect(screen.getByText('Published · unsaved changes')).toBeInTheDocument();
  });
});
