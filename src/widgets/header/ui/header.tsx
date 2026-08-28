'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ThemeToggle } from '@/features/theme-toggle';
import { LangSwitcher } from '@/features/language-switcher';
import { UserMenu } from '@/features/user-menu';
import { useAuth } from '@/app/providers/auth-provider';

export function Header() {
  const t = useTranslations('Header');
  const { user } = useAuth();

  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href={`/`} className="flex items-center gap-2">
            <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="text-background h-5 w-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
            </div>
            <span className="hidden text-lg font-semibold tracking-tight md:inline-block">
              BotFlow
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={'/login'}>{t('login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={'/signup'}>{t('signUp')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
