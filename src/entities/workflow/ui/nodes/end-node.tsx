'use client';

import { memo } from 'react';
import { Square, Trash2 } from 'lucide-react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { EndAppNode } from '../../model/types';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { useTranslations } from 'next-intl';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { NodeTextarea } from './fields';
import { useWorkflowActions } from '@/features/workflow-actions/model/context';

export const EndNode = memo(({ id, data }: NodeProps<EndAppNode>) => {
  const t = useTranslations('WorkflowEditor');
  const config = WORKFLOW_NODES_CONFIG.end;
  const { onNodeDelete } = useWorkflowActions();

  return (
    <BaseNode className="w-64">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <Square className="size-3.5" />
        </div>
        <BaseNodeHeaderTitle className="text-xs font-semibold">
          {t(`nodes.end.name`)}
        </BaseNodeHeaderTitle>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0"
          onClick={() => onNodeDelete(id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('nodes.end.description') || 'Exit Message'}
          </Label>

          <NodeTextarea
            nodeId={id}
            field="message"
            initialValue={data.message ?? ''}
            placeholder={t('nodes.end.description') || 'Enter exit message (optional)...'}
          />
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
});

EndNode.displayName = 'EndNode';
