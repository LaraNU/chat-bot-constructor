'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/shared/lib/utils';
import { Play, GripVertical } from 'lucide-react';

export function NodesPalette() {
  const t = useTranslations('NodesPalette');

  return (
    <aside className="border-border bg-card flex w-64 flex-col border-r">
      <div className="border-border border-b p-4">
        <h2 className="text-sm font-medium">{t('title')}</h2>
        <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          <div
            className={cn(
              'group bg-background flex cursor-grab items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-md active:cursor-grabbing',
              'hover:border-foreground/20'
            )}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md border',
                  'bg-success/15 text-success border-success/30'
                )}
              >
                <Play className="h-4 w-4" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t('startTrigger.title')}</p>
              <p className="text-muted-foreground truncate text-xs">
                {t('startTrigger.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
