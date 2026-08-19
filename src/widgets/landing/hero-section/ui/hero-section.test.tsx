import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import { useTranslations } from 'next-intl';
import { HeroSection } from './hero-section';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
    <img alt={alt} src={src} />
  ),
}));

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useTranslations as Mock).mockReturnValue((key: string) => {
      const dictionary: Record<string, string> = {
        title: 'Build Telegram bots with',
        titleHighlight: 'visual workflows',
        subtitle: 'Design conversation flows on a canvas.',
        primaryCta: 'Get started',
        secondaryCta: 'Sign in',
        imageAlt: 'Preview of the visual workflow editor canvas',
        previewBadge: 'Preview',
      };
      return dictionary[key] ?? key;
    });
  });

  test('renders i18n title, signup CTA, and editor preview', () => {
    render(<HeroSection />);

    expect(
      screen.getByRole('heading', { name: 'Build Telegram bots with visual workflows' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/signup');
    const preview = screen.getByRole('img', {
      name: 'Preview of the visual workflow editor canvas',
    });
    expect(preview).toHaveAttribute('src', '/landing/hero-editor.svg');
  });
});
