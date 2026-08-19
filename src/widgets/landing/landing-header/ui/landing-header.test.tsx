import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import { useTranslations } from 'next-intl';
import { LandingHeader } from './landing-header';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(() => 'en'),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}));

vi.mock('@/features/language-switcher', () => ({
  LangSwitcher: () => <div data-testid="lang-switcher" />,
}));

vi.mock('@/features/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe('LandingHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useTranslations as Mock).mockReturnValue((key: string) => {
      const dictionary: Record<string, string> = {
        brand: 'BotFlow',
        navHowItWorks: 'How it works',
        navFeatures: 'Features',
        navRoadmap: 'Roadmap',
        signIn: 'Sign in',
        getStarted: 'Get started',
      };
      return dictionary[key] ?? key;
    });
  });

  test('renders i18n navigation and auth CTAs', () => {
    render(<LandingHeader />);

    expect(screen.getByRole('link', { name: /BotFlow/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'How it works' })).toHaveAttribute(
      'href',
      '#how-it-works'
    );
    expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '#features');
    expect(screen.getByRole('link', { name: 'Roadmap' })).toHaveAttribute('href', '#roadmap');
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/signup');
  });
});
