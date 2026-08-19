'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { LangSwitcher } from '@/features/language-switcher';
import { ThemeToggle } from '@/features/theme-toggle';

export function LandingHeader() {
  const t = useTranslations('Landing.header');

  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="text-background h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">{t('brand')}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label={t('brand')}>
          <Link
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {t('navHowItWorks')}
          </Link>
          <Link
            href="#features"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {t('navFeatures')}
          </Link>
          <Link
            href="#roadmap"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {t('navRoadmap')}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">{t('signIn')}</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">{t('getStarted')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
