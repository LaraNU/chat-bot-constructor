'use client';

import { useTranslations } from 'next-intl';

export function EmptyState() {
  const t = useTranslations('PropertiesPanel');

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <p className="text-muted-foreground text-center text-xs">{t('emptyState')}</p>
    </div>
  );
}
