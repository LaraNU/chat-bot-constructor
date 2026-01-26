'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';

export function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = (newLocale: string): void => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        className={locale === 'en' ? 'text-primary' : 'text-muted-foreground'}
        onClick={() => toggleLocale('en')}
      >
        EN
      </Button>
      <span>/</span>
      <Button
        variant="ghost"
        className={locale === 'ru' ? 'text-primary' : 'text-muted-foreground'}
        onClick={() => toggleLocale('ru')}
      >
        RU
      </Button>
    </div>
  );
}
