'use client';

import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ListChecks, Trash2 } from 'lucide-react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';

import { WORKFLOW_NODES_CONFIG } from '../..';
import type { ChoiceAppNode, ChoiceButton } from '../../model/types';

import { ControlledTextarea } from '@/shared/ui/controlled-textarea';
import { ChoiceButtonsEditorMemoized } from '../choice-buttons-editor';
import { useTranslations } from 'next-intl';
import { useWorkflowStore } from '../../model/store';

export const ChoiceNode = memo(({ id, data }: NodeProps<ChoiceAppNode>) => {
  const config = WORKFLOW_NODES_CONFIG.choice;
  const t = useTranslations('WorkflowEditor.nodes.choice');
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const updateNode = useWorkflowStore((s) => s.updateNode);

  const handleDelete = () => {
    deleteNode(id);
  };

  const handleTextCommit = useCallback(
    (text: string) => {
      updateNode(id, { text });
    },
    [updateNode, id]
  );

  const handleButtonsUpdate = useCallback(
    (buttons: ChoiceButton[]) => {
      updateNode(id, { buttons });
    },
    [updateNode, id]
  );

  return (
    <BaseNode className="w-96">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="border-b bg-green-50">
        <div className={`rounded-sm border p-1 ${config.color}`}>
          <ListChecks className="size-3.5" />
        </div>

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="space-y-2 p-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('optionText')}
          </Label>

          <ControlledTextarea
            value={data.text ?? ''}
            placeholder={t('optionTextPlaceholder')}
            onCommit={handleTextCommit}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">
            {t('buttons')}
          </Label>

          <ChoiceButtonsEditorMemoized
            buttons={data.buttons ?? []}
            onUpdate={handleButtonsUpdate}
          />
        </div>
      </BaseNodeContent>

      {(data.buttons ?? []).map((button, index, buttons) => (
        <Handle
          key={button.id}
          type="source"
          id={button.id}
          position={Position.Bottom}
          style={{
            left: `${((index + 1) * 100) / (buttons.length + 1)}%`,
          }}
        />
      ))}
    </BaseNode>
  );
});

ChoiceNode.displayName = 'ChoiceNode';
