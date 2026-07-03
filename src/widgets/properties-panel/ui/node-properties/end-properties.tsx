'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import type { EndAppNode } from '@/entities/workflow/model/types';
import { useWorkflowStore } from '@/entities/workflow/model/store';

import {
  PropertyField,
  PropertySection,
  PropertyTextarea,
} from '@/widgets/properties-panel/ui/fields';

interface EndPropertiesProps {
  node: EndAppNode;
}

export function EndProperties({ node }: EndPropertiesProps) {
  const updateNode = useWorkflowStore((s) => s.updateNode);
  const t = useTranslations('WorkflowEditor.nodes.end');

  const handleMessageCommit = useCallback(
    (message: string) => {
      updateNode(node.id, { message });
    },
    [updateNode, node.id]
  );

  return (
    <PropertySection title={t('name')}>
      <PropertyField label={t('description')}>
        <PropertyTextarea
          value={node.data.message ?? ''}
          placeholder={t('messagePlaceholder')}
          onCommit={handleMessageCommit}
        />
      </PropertyField>
    </PropertySection>
  );
}
