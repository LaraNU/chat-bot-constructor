'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { BrandMark } from '@/shared/ui/brand-mark';
import { LangSwitcher } from '@/features/language-switcher';
import { ThemeToggle } from '@/features/theme-toggle';

export function LandingHeader() {
  const t = useTranslations('Landing.header');

  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <BrandMark name={t('brand')} />
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

        <div className="flex items-center gap-1 min-[380px]:gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <Button variant="ghost" asChild className="px-2 min-[380px]:px-4">
            <Link href="/login">{t('signIn')}</Link>
          </Button>
          <Button asChild className="px-2 min-[380px]:px-4">
            <Link href="/signup">{t('getStarted')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
