'use client';

import { Heading } from '@/shared/ui/typography/heading';
import { useTranslations } from 'next-intl';
import { EmptyState } from './empty-state';
import { useSelectedNode } from '@/entities/workflow/model/store/selectors';
import { NodePropertiesRouter } from './node-properties-router';
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/sheet';

type Props = {
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PropertiesPanel({ isMobile, open, onOpenChange }: Props) {
  const t = useTranslations('PropertiesPanel');
  const selectedNode = useSelectedNode();

  const body = selectedNode ? <NodePropertiesRouter node={selectedNode} /> : <EmptyState />;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent side="right" className="gap-0 p-0">
          <div className="border-border border-b p-4">
            <SheetTitle className="text-lg font-medium">{t('title')}</SheetTitle>
            <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
          </div>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="border-border bg-card flex w-72 flex-col border-l">
      <div className="border-border border-b p-4">
        <Heading level={4}>{t('title')}</Heading>
        <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
      </div>
      {body}
    </aside>
  );
}
