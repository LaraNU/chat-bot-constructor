'use client';

import { memo } from 'react';
import { Trash2 } from 'lucide-react';
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
import { ControlledTextarea } from '@/shared/ui/controlled-textarea';
import { useNodeMutations } from '../../model/store';
import { WorkflowNodeIcon } from '../workflow-node-icon';

export const EndNode = memo(({ id, data }: NodeProps<EndAppNode>) => {
  const t = useTranslations('WorkflowEditor.nodes.end');
  const { remove, commit } = useNodeMutations<EndAppNode['data']>(id);

  return (
    <BaseNode className="w-64">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <WorkflowNodeIcon type="end" />

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0"
          onClick={remove}
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
            onCommit={commit('message')}
          />
        </div>
      </BaseNodeContent>
    </BaseNode>
  );
});

EndNode.displayName = 'EndNode';
