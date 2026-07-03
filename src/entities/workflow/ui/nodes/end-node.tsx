'use client';

import { memo, useCallback } from 'react';
import { Square, Trash2 } from 'lucide-react';
import { NodeProps, Handle, Position } from '@xyflow/react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';

import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';

import { useTranslations } from 'next-intl';

import { EndAppNode } from '../../model/types';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';

import { ControlledTextarea } from '@/shared/ui/controlled-textarea';

import { useWorkflowStore } from '../../model/store';

export const EndNode = memo(({ id, data }: NodeProps<EndAppNode>) => {
  const t = useTranslations('WorkflowEditor.nodes.end');
  const config = WORKFLOW_NODES_CONFIG.end;
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const updateNode = useWorkflowStore((s) => s.updateNode);

  const handleDelete = () => {
    deleteNode(id);
  };

  const handleMessageCommit = useCallback(
    (message: string) => {
      updateNode(id, { message });
    },
    [updateNode, id]
  );

  return (
    <BaseNode className="w-64">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <Square className="size-3.5" />
        </div>

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0"
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('description')}
          </Label>

          <ControlledTextarea
            value={data.message ?? ''}
            placeholder={t('messagePlaceholder')}
            onCommit={handleMessageCommit}
          />
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
});

EndNode.displayName = 'EndNode';
