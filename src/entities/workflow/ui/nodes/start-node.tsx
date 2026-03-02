'use client';
import { Handle, Position } from '@xyflow/react';
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { useTranslations } from 'next-intl';
import { Play } from 'lucide-react';
import { memo } from 'react';

export const StartNode = memo(() => {
  const t = useTranslations('WorkflowEditor');

  const config = WORKFLOW_NODES_CONFIG.start;

  return (
    <BaseNode className="w-64">
      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <Play className="size-3.5" />
        </div>
        <BaseNodeHeaderTitle className="text-xs font-semibold">
          {t(`nodes.start.name`)}
        </BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('nodes.start.description') || 'Start Node Description'}
          </label>
        </div>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

StartNode.displayName = 'StartNode';
