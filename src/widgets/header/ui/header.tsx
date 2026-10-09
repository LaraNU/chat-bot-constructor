'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { BrandMark } from '@/shared/ui/brand-mark';
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
          <Link href={`/`}>
            <BrandMark name="BotFlow" />
          </Link>
        </div>

        <div className="flex items-center gap-1 min-[380px]:gap-2">
          <LangSwitcher />
          <ThemeToggle />

          {user ? (
            <>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="h-4 w-4" />
              </Button>
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="px-2 min-[380px]:px-3">
                <Link href={'/login'}>{t('login')}</Link>
              </Button>
              {/* Hidden on the narrowest screens: it doesn't fit next to the
                  other controls, and the login page links to sign-up anyway. */}
              <Button size="sm" asChild className="hidden min-[420px]:inline-flex">
                <Link href={'/signup'}>{t('signUp')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
