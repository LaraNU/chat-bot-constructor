'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';

import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';

import type { MessageAppNode } from '../../model/types';

import { useTranslations } from 'next-intl';
import { useNodeMutations } from '../../model/store';
import { ControlledTextarea } from '@/shared/ui/controlled-textarea';
import { WorkflowNodeIcon } from '../workflow-node-icon';

export const MessageNode = memo(({ id, data }: NodeProps<MessageAppNode>) => {
  const t = useTranslations('WorkflowEditor.nodes.message');
  const { remove, commit } = useNodeMutations<MessageAppNode['data']>(id);

  return (
    <BaseNode className="w-80">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <WorkflowNodeIcon type="message" />

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button variant="ghost" size="sm" onClick={remove}>
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="p-3">
        <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
          {t('description')}
        </Label>

        <ControlledTextarea
          value={data.text}
          onCommit={commit('text')}
          placeholder={t('messagePlaceholder')}
          className="max-h-[80px] resize-none overflow-y-auto"
        />
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

MessageNode.displayName = 'MessageNode';
