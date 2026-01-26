'use client';

import { useTranslations } from 'next-intl';

export function PropertiesPanel() {
  const t = useTranslations('PropertiesPanel');

  return (
    <aside className="border-border bg-card flex w-72 flex-col border-l">
      <div className="border-border border-b p-4">
        <h2 className="text-sm font-medium">{t('title')}</h2>
        <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-muted-foreground text-center text-xs">{t('emptyState')}</p>
      </div>
    </aside>
  );
}
