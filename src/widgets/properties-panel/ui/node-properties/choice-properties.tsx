'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import type { ChoiceAppNode, ChoiceButton } from '@/entities/workflow/model/types';
import { useWorkflowStore } from '@/entities/workflow/model/store';
import { ChoiceButtonsEditorMemoized } from '@/entities/workflow';

import {
  PropertyField,
  PropertySection,
  PropertyTextarea,
} from '@/widgets/properties-panel/ui/fields';

interface ChoicePropertiesProps {
  node: ChoiceAppNode;
}

export function ChoiceProperties({ node }: ChoicePropertiesProps) {
  const t = useTranslations('WorkflowEditor.nodes.choice');
  const updateNode = useWorkflowStore((s) => s.updateNode);

  const handleTextCommit = useCallback(
    (text: string) => {
      updateNode(node.id, { text });
    },
    [updateNode, node.id]
  );

  const handleButtonsUpdate = useCallback(
    (buttons: ChoiceButton[]) => {
      updateNode(node.id, { buttons });
    },
    [updateNode, node.id]
  );

  return (
    <PropertySection title={t('name')}>
      <PropertyField label={t('optionText')}>
        <PropertyTextarea
          value={node.data.text ?? ''}
          placeholder={t('optionTextPlaceholder')}
          onCommit={handleTextCommit}
        />
      </PropertyField>

      <PropertyField label={t('buttons')}>
        <ChoiceButtonsEditorMemoized
          buttons={node.data.buttons ?? []}
          onUpdate={handleButtonsUpdate}
        />
      </PropertyField>
    </PropertySection>
  );
}
