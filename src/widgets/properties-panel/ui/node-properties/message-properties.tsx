'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import type { MessageAppNode } from '@/entities/workflow/model/types';
import { useWorkflowStore } from '@/entities/workflow/model/store';

import { PropertySection, PropertyTextarea } from '@/widgets/properties-panel/ui/fields';

interface MessagePropertiesProps {
  node: MessageAppNode;
}

export function MessageProperties({ node }: MessagePropertiesProps) {
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const t = useTranslations('WorkflowEditor.nodes.message');

  const handleTextCommit = useCallback(
    (text: string) => {
      updateNode(node.id, { text });
    },
    [updateNode, node.id]
  );

  return (
    <PropertySection title={t('name')}>
      <PropertyTextarea
        value={node.data.text}
        placeholder={t('messagePlaceholder')}
        onCommit={handleTextCommit}
      />
      <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
    </PropertySection>
  );
}
