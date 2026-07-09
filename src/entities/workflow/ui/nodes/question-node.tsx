'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { memo } from 'react';
import { Trash2 } from 'lucide-react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { Button } from '@/shared/ui/button';
import { EditorField } from '@/shared/ui/editor-field';

import { QuestionAppNode } from '../../model/types';

import { ControlledInput } from '@/shared/ui/controlled-input';
import { ControlledTextarea } from '@/shared/ui/controlled-textarea';
import { useTranslations } from 'next-intl';
import { useNodeMutations } from '../../model/store';
import { WorkflowNodeIcon } from '../workflow-node-icon';

export const QuestionNode = memo(({ id, data }: NodeProps<QuestionAppNode>) => {
  const t = useTranslations('WorkflowEditor.nodes.question');
  const { remove, commit } = useNodeMutations<QuestionAppNode['data']>(id);

  return (
    <BaseNode className="w-80">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="border-b bg-yellow-50">
        <WorkflowNodeIcon type="question" />

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button variant="ghost" size="sm" onClick={remove}>
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <EditorField label={t('description')}>
          <ControlledTextarea
            value={data.text}
            onCommit={commit('text')}
            placeholder={t('questionPlaceholder')}
          />
        </EditorField>

        <EditorField label={t('questionTitle')}>
          <ControlledInput
            value={data.answerLabel}
            placeholder={t('questionPlaceholder')}
            onCommit={commit('answerLabel')}
          />
        </EditorField>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

QuestionNode.displayName = 'QuestionNode';
