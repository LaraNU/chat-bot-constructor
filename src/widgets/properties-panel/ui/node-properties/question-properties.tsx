'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import type { QuestionAppNode } from '@/entities/workflow/model/types';
import { useWorkflowStore } from '@/entities/workflow/model/store';

import {
  PropertyField,
  PropertyInput,
  PropertySection,
  PropertyTextarea,
} from '@/widgets/properties-panel/ui/fields';

interface QuestionPropertiesProps {
  node: QuestionAppNode;
}

export function QuestionProperties({ node }: QuestionPropertiesProps) {
  const t = useTranslations('WorkflowEditor.nodes.question');
  const updateNode = useWorkflowStore((s) => s.updateNode);

  const handleTextCommit = useCallback(
    (text: string) => {
      updateNode(node.id, { text });
    },
    [updateNode, node.id]
  );

  const handleAnswerLabelCommit = useCallback(
    (answerLabel: string) => {
      updateNode(node.id, { answerLabel });
    },
    [updateNode, node.id]
  );

  return (
    <PropertySection title={t('name')}>
      <PropertyField label={t('description')}>
        <PropertyTextarea
          value={node.data.text}
          placeholder={t('questionPlaceholder')}
          onCommit={handleTextCommit}
        />
      </PropertyField>

      <PropertyField label={t('questionTitle')}>
        <PropertyInput
          value={node.data.answerLabel}
          placeholder={t('questionPlaceholder')}
          onCommit={handleAnswerLabelCommit}
        />
      </PropertyField>
    </PropertySection>
  );
}
