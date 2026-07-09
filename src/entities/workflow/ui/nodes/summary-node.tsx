'use client';

import { memo, useMemo } from 'react';
import { Handle, NodeProps, Position, useStore } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';

import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { EditorField } from '@/shared/ui/editor-field';

import { ControlledTextarea } from '@/shared/ui/controlled-textarea';

import { AppNode, QuestionAppNode, SummaryAppNode } from '../../model/types';

import { getQuestionLabel } from '../../lib';
import { useTranslations } from 'next-intl';
import { useNodeMutations } from '../../model/store';
import { WorkflowNodeIcon } from '../workflow-node-icon';

export const SummaryNode = memo(({ id, data }: NodeProps<SummaryAppNode>) => {
  const t = useTranslations('WorkflowEditor.nodes.summary');
  const { remove, patch } = useNodeMutations<SummaryAppNode['data']>(id);

  const nodes = useStore((state) => state.nodes as AppNode[]);

  const questions = useMemo(
    () => nodes.filter((node): node is QuestionAppNode => node.type === 'question'),
    [nodes]
  );

  const toggleQuestion = (questionId: string) => {
    const current = data.includedQuestionIds ?? [];

    const next = current.includes(questionId)
      ? current.filter((id) => id !== questionId)
      : [...current, questionId];

    patch({ includedQuestionIds: next });
  };

  return (
    <BaseNode className="w-96">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="border-b bg-violet-50">
        <WorkflowNodeIcon type="summary" />

        <BaseNodeHeaderTitle>{t('name')}</BaseNodeHeaderTitle>

        <Button variant="ghost" size="sm" onClick={remove}>
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <EditorField label={t('summaryTitle')}>
          <ControlledTextarea
            value={data.introText ?? ''}
            placeholder={t('summaryTitlePlaceholder')}
            onCommit={(value) => patch({ introText: value })}
          />
        </EditorField>

        <EditorField label={t('includedFields')}>
          <div className="bg-card/50 space-y-3 rounded-md border p-3">
            {questions.map((question) => {
              const checkboxId = `question-${id}-${question.id}`;
              const isChecked = (data.includedQuestionIds ?? []).includes(question.id);
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
        </EditorField>

        <EditorField label={t('template')}>
          <ControlledTextarea
            value={data.customTemplate ?? ''}
            placeholder={t('templatePlaceholder')}
            onCommit={(value) => patch({ customTemplate: value })}
          />
        </EditorField>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

SummaryNode.displayName = 'SummaryNode';
