'use client';

import { memo, useCallback } from 'react';
import { Square, Trash2 } from 'lucide-react';
import { NodeProps, Handle, Position, useReactFlow } from '@xyflow/react';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { EndAppNode } from '../../model/types';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';

export const EndNode = memo(({ id, data }: NodeProps<EndAppNode>) => {
  const t = useTranslations('WorkflowEditor');
  const config = WORKFLOW_NODES_CONFIG.end;
  const { setNodes } = useReactFlow();

  const onChangeMessage = (val: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, message: val } };
        }
        return node;
      })
    );
  };

  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
  }, [id, setNodes]);

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
          onClick={handleDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('nodes.end.description') || 'Exit Message'}
          </Label>
          <Textarea
            className="nodrag nowheel"
            placeholder={t('end.messagePlaceholder') || 'Enter exit message (optional)...'}
            value={data.message ?? ''}
            onChange={(e) => onChangeMessage(e.target.value)}
          />
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
});

EndNode.displayName = 'EndNode';
