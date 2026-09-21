'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useTranslations } from 'next-intl';

import { BaseNode } from '@/shared/ui/base-node';

import { WorkflowNodeIcon } from '../workflow-node-icon';
import { NODE_HANDLE_SIZE_CLASSNAME } from './responsive-classnames';

export const StartNode = memo(() => {
  const t = useTranslations('WorkflowEditor.nodes.start');

  return (
    <BaseNode className="flex w-fit items-center gap-2 px-3 py-2">
      <WorkflowNodeIcon type="start" />
      <span className="text-sm font-medium">{t('name')}</span>

      <Handle type="source" position={Position.Bottom} className={NODE_HANDLE_SIZE_CLASSNAME} />
    </BaseNode>
  );
});

StartNode.displayName = 'StartNode';
