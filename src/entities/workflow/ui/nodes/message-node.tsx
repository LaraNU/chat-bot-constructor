'use client';

import { memo } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { useTranslations } from 'next-intl';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';

import type { MessageAppNode } from '../../model/types';
import { WORKFLOW_NODES_CONFIG } from '../../model/nodes-config';
import { useWorkflowActions } from '@/features/workflow-actions';
import { NodeTextarea } from './fields/node-textarea';
import { NodeInput } from './fields';
import { NodeButtons } from './fields/node-buttons';

export const MessageNode = memo(({ id, data }: NodeProps<MessageAppNode>) => {
  const t = useTranslations('WorkflowEditor');
  const config = WORKFLOW_NODES_CONFIG.message;
  const { onNodeDelete } = useWorkflowActions();

  return (
    <BaseNode className="w-64">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="bg-muted/30 border-b">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <MessageSquare className="size-3.5" />
        </div>
        <BaseNodeHeaderTitle className="text-xs font-semibold">
          {t('nodes.message.name')}
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
            {t('nodes.message.description') || 'Message Text'}
          </Label>

          <NodeTextarea
            nodeId={id}
            field="text"
            initialValue={data.text ?? ''}
            placeholder={t('nodes.message.description') || 'Enter message...'}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('nodes.message.saveToVariable') || 'Save user input to variable'}
          </Label>
          <NodeInput
            nodeId={id}
            field="saveToVariable"
            initialValue={data.saveToVariable ?? ''}
            placeholder={t('nodes.message.saveToVariablePlaceholder') || 'variable_name'}
            className="h-8 text-xs"
          />
        </div>

        <div className="flex flex-col gap-1.5 border-t pt-2">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('nodes.message.buttons') || 'Inline Buttons'}
          </Label>
          <NodeButtons nodeId={id} buttons={data.buttons} />
        </div>
      </BaseNodeContent>

      <Handle type="source" position={Position.Bottom} />
    </BaseNode>
  );
});

MessageNode.displayName = 'MessageNode';
