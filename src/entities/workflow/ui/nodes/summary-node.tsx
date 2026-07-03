'use client';

import { memo, useMemo } from 'react';
import { Handle, NodeProps, Position, useStore } from '@xyflow/react';
import { ClipboardList, Trash2 } from 'lucide-react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';

import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';

import { ControlledTextarea } from '@/shared/ui/controlled-textarea';

import { AppNode, QuestionAppNode, SummaryAppNode, SummaryNodeData } from '../../model/types';

import { getQuestionLabel } from '../../lib';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { useTranslations } from 'next-intl';
import { useWorkflowStore } from '../../model/store';

export const SummaryNode = memo(({ id, data }: NodeProps<SummaryAppNode>) => {
  const config = WORKFLOW_NODES_CONFIG.summary;
  const t = useTranslations('WorkflowEditor.nodes.summary');

  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const updateNode = useWorkflowStore((s) => s.updateNode);

  const nodes = useStore((state) => state.nodes as AppNode[]);

  const questions = useMemo(
    () => nodes.filter((node): node is QuestionAppNode => node.type === 'question'),
    [nodes]
  );

  const handleDelete = () => {
    deleteNode(id);
  };

  const handleUpdate = (payload: Partial<SummaryNodeData>) => {
    updateNode(id, payload);
  };

  const toggleQuestion = (questionId: string) => {
    const current = data.includedQuestionIds ?? [];

    const next = current.includes(questionId)
      ? current.filter((id) => id !== questionId)
      : [...current, questionId];

    handleUpdate({
      includedQuestionIds: next,
    });
  };

  return (
    <BaseNode className="w-96">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="border-b bg-violet-50">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <ClipboardList className="size-3.5" />
        </div>

        <BaseNodeHeaderTitle>{t('name')}</BaseNodeHeaderTitle>

        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('summaryTitle')}
          </Label>

          <ControlledTextarea
            value={data.introText ?? ''}
            placeholder={t('summaryTitlePlaceholder')}
            onCommit={(value) =>
              handleUpdate({
                introText: value,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('includedFields')}
          </Label>

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
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('template')}
          </Label>

          <ControlledTextarea
            value={data.customTemplate ?? ''}
            placeholder={t('templatePlaceholder')}
            onCommit={(value) =>
              handleUpdate({
                customTemplate: value,
              })
            }
          />
        </div>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

SummaryNode.displayName = 'SummaryNode';
