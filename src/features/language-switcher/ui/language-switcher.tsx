'use client';

import { useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  en: 'EN',
  ru: 'RU',
};

export function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string): void => {
    router.replace(pathname, { locale: newLocale });
  };

  const currentLabel = LOCALE_LABELS[locale as keyof typeof LOCALE_LABELS] ?? locale.toUpperCase();

  return (
    <>
      <div
        className="hidden items-center gap-1 min-[732px]:flex"
        data-testid="lang-switcher-inline"
      >
        {routing.locales.map((item, index) => (
          <span key={item} className="contents">
            {index > 0 ? <span>/</span> : null}
            <Button
              variant="ghost"
              className={locale === item ? 'text-primary' : 'text-muted-foreground'}
              onClick={() => switchLocale(item)}
            >
              {LOCALE_LABELS[item]}
            </Button>
          </span>
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="min-[732px]:hidden"
            data-testid="lang-switcher-dropdown"
            aria-label={currentLabel}
          >
            {currentLabel}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {routing.locales.map((item) => (
            <DropdownMenuItem
              key={item}
              onSelect={() => switchLocale(item)}
              className={locale === item ? 'text-primary' : undefined}
            >
              {LOCALE_LABELS[item]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
