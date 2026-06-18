'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { memo, useCallback } from 'react';
import { CircleHelp, Trash2 } from 'lucide-react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';

import { QuestionAppNode } from '../../model/types';
import { WORKFLOW_NODES_CONFIG } from '../..';

import { CommitInput, CommitTextarea } from './fields';
import { useTranslations } from 'next-intl';
import { useWorkflowActions } from '@/features/workflow-actions/model/context';

export const QuestionNode = memo(({ id, data }: NodeProps<QuestionAppNode>) => {
  const config = WORKFLOW_NODES_CONFIG.question;
  const t = useTranslations('WorkflowEditor.nodes.question');
  const { onNodeDelete, onNodeUpdate } = useWorkflowActions();

  const handleDelete = () => {
    onNodeDelete(id);
  };

  const handleTextCommit = useCallback(
    (text: string) => {
      onNodeUpdate(id, { text });
    },
    [onNodeUpdate, id]
  );

  const handleAnswerLabelCommit = useCallback(
    (answerLabel: string) => {
      onNodeUpdate(id, { answerLabel });
    },
    [onNodeUpdate, id]
  );

  return (
    <BaseNode className="w-80">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="border-b bg-yellow-50">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <CircleHelp className="size-3.5" />
        </div>

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('description')}
          </Label>

          <CommitTextarea
            value={data.text}
            onCommit={handleTextCommit}
            placeholder={t('questionPlaceholder')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('questionTitle')}
          </Label>

          <CommitInput
            value={data.answerLabel}
            placeholder={t('questionPlaceholder')}
            onCommit={handleAnswerLabelCommit}
          />
        </div>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

QuestionNode.displayName = 'QuestionNode';
