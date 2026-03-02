'use client';

import { memo } from 'react';
import { MessageSquare } from 'lucide-react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { AppNode, MessageNodeData } from '../../model/types';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { useTranslations } from 'next-intl';

export const MessageNode = memo(({ data }: NodeProps<AppNode>) => {
  const t = useTranslations('WorkflowEditor');
  const nodeData = data as MessageNodeData;
  const config = WORKFLOW_NODES_CONFIG.message;

  return (
    <BaseNode className="w-64">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <MessageSquare className="size-3.5" />
        </div>
        <BaseNodeHeaderTitle className="text-xs font-semibold">
          {t(`nodes.message.name`)}
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('nodes.message.description') || 'Message Text'}
          </label>
          <textarea
            className="nodrag nowheel border-input focus-visible:ring-primary min-h-[80px] w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors outline-none focus-visible:ring-1"
            placeholder={t('nodes.message.description') || 'Enter message...'}
            value={nodeData.text}
            onChange={(e) => nodeData.onChange?.(e.target.value)}
          />
        </div>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

MessageNode.displayName = 'MessageNode';
