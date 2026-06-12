'use client';

import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare, Trash2 } from 'lucide-react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';

import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';

import type { MessageAppNode } from '../../model/types';

import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { CommitTextarea } from './fields';
import { useTranslations } from 'next-intl';

export const MessageNode = memo(({ id, data }: NodeProps<MessageAppNode>) => {
  const config = WORKFLOW_NODES_CONFIG.message;
  const t = useTranslations('WorkflowEditor.nodes.message');

  const handleDelete = () => {
    data.actions?.onNodeDelete(id);
  };

  const handleTextCommit = useCallback(
    (text: string) => {
      data.actions?.onNodeUpdate(id, { text });
    },
    [data.actions, id]
  );

  return (
    <BaseNode className="w-80">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <MessageSquare className="size-3.5" />
        </div>

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="p-3">
        <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
          {t('description')}
        </Label>

        <CommitTextarea
          value={data.text}
          onCommit={handleTextCommit}
          placeholder={t('messagePlaceholder')}
        />
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

MessageNode.displayName = 'MessageNode';
