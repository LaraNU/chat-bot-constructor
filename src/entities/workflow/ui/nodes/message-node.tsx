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
import { useTranslations } from 'next-intl';
import { useWorkflowStore } from '../../model/store';
import { ControlledTextarea } from '@/shared/ui/controlled-textarea';

export const MessageNode = memo(({ id, data }: NodeProps<MessageAppNode>) => {
  const config = WORKFLOW_NODES_CONFIG.message;
  const t = useTranslations('WorkflowEditor.nodes.message');
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const updateNode = useWorkflowStore((s) => s.updateNode);

  const handleDelete = () => {
    deleteNode(id);
  };

  const handleTextCommit = useCallback(
    (text: string) => {
      updateNode(id, { text });
    },
    [updateNode, id]
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

        <ControlledTextarea
          value={data.text}
          onCommit={handleTextCommit}
          placeholder={t('messagePlaceholder')}
          className="max-h-[80px] resize-none overflow-y-auto"
        />
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

MessageNode.displayName = 'MessageNode';
