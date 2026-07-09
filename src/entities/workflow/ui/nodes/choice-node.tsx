'use client';

import { memo, useCallback } from 'react';

import { Handle, Position, NodeProps } from '@xyflow/react';

import { Trash2 } from 'lucide-react';

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/shared/ui/base-node';

import { Button } from '@/shared/ui/button';

import { Label } from '@/shared/ui/label';

import type { ChoiceAppNode, ChoiceButton } from '../../model/types';

import { ControlledTextarea } from '@/shared/ui/controlled-textarea';

import { ChoiceButtonsEditorMemoized } from '../choice-buttons-editor';

import { useTranslations } from 'next-intl';

import { useNodeMutations } from '../../model/store';

import { WorkflowNodeIcon } from '../workflow-node-icon';

export const ChoiceNode = memo(({ id, data }: NodeProps<ChoiceAppNode>) => {
  const t = useTranslations('WorkflowEditor.nodes.choice');

  const { remove, commit, patch } = useNodeMutations<ChoiceAppNode['data']>(id);

  const handleButtonsUpdate = useCallback(
    (buttons: ChoiceButton[]) => {
      patch({ buttons });
    },

    [patch]
  );

  return (
    <BaseNode className="w-96">
      <Handle type="target" position={Position.Top} />

      <BaseNodeHeader className="border-b bg-green-50">
        <WorkflowNodeIcon type="choice" />

        <BaseNodeHeaderTitle className="text-xs font-semibold">{t('name')}</BaseNodeHeaderTitle>

        <Button variant="ghost" size="sm" onClick={remove}>
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
            onCommit={commit('text')}
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
