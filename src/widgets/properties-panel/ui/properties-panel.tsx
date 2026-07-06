'use client';

import { Heading } from '@/shared/ui/typography/heading';
import { useTranslations } from 'next-intl';
import { EmptyState } from './empty-state';
import { useSelectedNode } from '@/entities/workflow/model/store/selectors';
import { NodePropertiesRouter } from './node-properties-router';

export function PropertiesPanel() {
  const t = useTranslations('PropertiesPanel');
  const selectedNode = useSelectedNode();

  return (
    <aside className="border-border bg-card flex w-72 flex-col border-l">
      <div className="border-border border-b p-4">
        <Heading level={4}>{t('title')}</Heading>
        <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
      </div>
      {selectedNode ? <NodePropertiesRouter node={selectedNode} /> : <EmptyState />}
    </aside>
  );
}
