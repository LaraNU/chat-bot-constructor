'use client';

import { memo } from 'react';
import { Play } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { useTranslations } from 'next-intl';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';

export const StartNode = memo(() => {
  const t = useTranslations('WorkflowEditor.nodes.start');

  return (
    <BaseNode className="w-64">
      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${WORKFLOW_NODES_CONFIG.start.color}`}>
          <Play className="size-3.5" />
        </div>
        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-3 p-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('description')}
          </span>
        </div>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

StartNode.displayName = 'StartNode';
