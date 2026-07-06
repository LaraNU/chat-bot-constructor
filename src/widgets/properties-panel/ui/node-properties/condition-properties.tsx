'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { buildQuestionOptions } from '@/entities/workflow/lib';
import type { ConditionAppNode, ConditionNodeData } from '@/entities/workflow/model/types';
import { useUpdateNode, useWorkflowNodes } from '@/entities/workflow/model/store';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

import {
  PropertyField,
  PropertyInput,
  PropertySection,
} from '@/widgets/properties-panel/ui/fields';

interface ConditionPropertiesProps {
  node: ConditionAppNode;
}

export function ConditionProperties({ node }: ConditionPropertiesProps) {
  const t = useTranslations('WorkflowEditor.nodes.condition');
  const updateNode = useUpdateNode();
  const nodes = useWorkflowNodes();

  const availableQuestions = useMemo(
    () => buildQuestionOptions(nodes, (id) => t('questionFallback', { id })),
    [nodes, t]
  );

  const handleQuestionChange = useCallback(
    (questionNodeId: string) => {
      updateNode(node.id, { questionNodeId });
    },
    [updateNode, node.id]
  );

  const handleOperatorChange = useCallback(
    (operator: string) => {
      updateNode(node.id, {
        operator: operator as ConditionNodeData['operator'],
      });
    },
    [updateNode, node.id]
  );

  const handleValueCommit = useCallback(
    (value: string) => {
      updateNode(node.id, { value });
    },
    [updateNode, node.id]
  );

  return (
    <PropertySection title={t('name')}>
      <PropertyField label={t('question')}>
        <Select value={node.data.questionNodeId} onValueChange={handleQuestionChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t('selectQuestion')} />
          </SelectTrigger>

          <SelectContent>
            {availableQuestions.map((question) => (
              <SelectItem key={question.value} value={question.value}>
                {question.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PropertyField>

      <PropertyField label={t('check')}>
        <Select value={node.data.operator} onValueChange={handleOperatorChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="equals">{t('operators.equals')}</SelectItem>
            <SelectItem value="contains">{t('operators.contains')}</SelectItem>
          </SelectContent>
        </Select>
      </PropertyField>

      <PropertyField label={t('value')}>
        <PropertyInput
          value={node.data.value}
          placeholder={t('valuePlaceholder')}
          onCommit={handleValueCommit}
        />
      </PropertyField>
    </PropertySection>
  );
}
