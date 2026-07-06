'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { getQuestionLabel } from '@/entities/workflow/lib';
import type { QuestionAppNode, SummaryAppNode } from '@/entities/workflow/model/types';
import { useUpdateNode, useWorkflowNodes } from '@/entities/workflow/model/store';

import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';

import {
  PropertyField,
  PropertySection,
  PropertyTextarea,
} from '@/widgets/properties-panel/ui/fields';

interface SummaryPropertiesProps {
  node: SummaryAppNode;
}

export function SummaryProperties({ node }: SummaryPropertiesProps) {
  const t = useTranslations('WorkflowEditor.nodes.summary');
  const updateNode = useUpdateNode();
  const nodes = useWorkflowNodes();

  const questions = useMemo(
    () =>
      nodes.filter(
        (workflowNode): workflowNode is QuestionAppNode => workflowNode.type === 'question'
      ),
    [nodes]
  );

  const includedQuestionIds = useMemo(
    () => node.data.includedQuestionIds ?? [],
    [node.data.includedQuestionIds]
  );

  const handleIntroTextCommit = useCallback(
    (introText: string) => {
      updateNode(node.id, { introText });
    },
    [updateNode, node.id]
  );

  const handleCustomTemplateCommit = useCallback(
    (customTemplate: string) => {
      updateNode(node.id, { customTemplate });
    },
    [updateNode, node.id]
  );

  const toggleQuestion = useCallback(
    (questionId: string) => {
      const next = includedQuestionIds.includes(questionId)
        ? includedQuestionIds.filter((id) => id !== questionId)
        : [...includedQuestionIds, questionId];

      updateNode(node.id, { includedQuestionIds: next });
    },
    [includedQuestionIds, updateNode, node.id]
  );

  return (
    <PropertySection title={t('name')}>
      <PropertyField label={t('summaryTitle')}>
        <PropertyTextarea
          value={node.data.introText ?? ''}
          placeholder={t('summaryTitlePlaceholder')}
          onCommit={handleIntroTextCommit}
        />
      </PropertyField>

      <PropertyField label={t('includedFields')}>
        <div className="bg-card/50 space-y-3 rounded-md border p-3">
          {questions.map((question) => {
            const checkboxId = `question-${node.id}-${question.id}`;
            const isChecked = includedQuestionIds.includes(question.id);

            return (
              <div key={question.id} className="flex items-center space-x-2">
                <Checkbox
                  id={checkboxId}
                  checked={isChecked}
                  onCheckedChange={() => toggleQuestion(question.id)}
                />
                <Label htmlFor={checkboxId} className="font-normal">
                  {getQuestionLabel(question)}
                </Label>
              </div>
            );
          })}
        </div>
      </PropertyField>

      <PropertyField label={t('template')}>
        <PropertyTextarea
          value={node.data.customTemplate ?? ''}
          placeholder={t('templatePlaceholder')}
          onCommit={handleCustomTemplateCommit}
        />
      </PropertyField>
    </PropertySection>
  );
}
