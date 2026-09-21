'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';

import { Button } from '@/shared/ui/button';
import { EditorField } from '@/shared/ui/editor-field';

import type { MessageAppNode } from '../../model/types';

import { useTranslations } from 'next-intl';
import { useNodeMutations } from '../../model/store';
import { ControlledTextarea } from '@/shared/ui/controlled-textarea';
import { WorkflowNodeIcon } from '../workflow-node-icon';
import {
  RESPONSIVE_NODE_WIDTH_CLASSNAME,
  NODE_HANDLE_SIZE_CLASSNAME,
} from './responsive-classnames';
import { cn } from '@/shared/lib/utils';

export const MessageNode = memo(({ id, data }: NodeProps<MessageAppNode>) => {
  const t = useTranslations('WorkflowEditor.nodes.message');
  const { remove, commit } = useNodeMutations<MessageAppNode['data']>(id);

  return (
    <BaseNode className={cn('w-80', RESPONSIVE_NODE_WIDTH_CLASSNAME)}>
      <Handle type="target" position={Position.Top} className={NODE_HANDLE_SIZE_CLASSNAME} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <WorkflowNodeIcon type="message" />

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button variant="ghost" size="sm" onClick={remove}>
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="p-3">
        <EditorField label={t('description')}>
          <ControlledTextarea
            value={data.text}
            onCommit={commit('text')}
            placeholder={t('messagePlaceholder')}
            className="max-h-[80px] resize-none overflow-y-auto"
          />
        </EditorField>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} className={NODE_HANDLE_SIZE_CLASSNAME} />
    </BaseNode>
  );
});

MessageNode.displayName = 'MessageNode';
