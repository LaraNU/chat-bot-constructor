'use client';

import { useTranslations } from 'next-intl';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useWorkflowActions } from '@/features/workflow-actions';
import type { InlineButton, MessageNodeData } from '../../../model/types';

interface NodeButtonsProps {
  nodeId: string;
  buttons?: InlineButton[];
}

const PRESET_VALUES = [
  { value: 'yes' },
  { value: 'no' },
  { value: 'cancel' },
  { value: 'back' },
] as const;

export function NodeButtons({ nodeId, buttons = [] }: NodeButtonsProps) {
  const { onNodeUpdate } = useWorkflowActions();
  const t = useTranslations('WorkflowEditor.nodes.message.nodeButtons');

  const handleAddCustomButton = () => {
    const newButton: InlineButton = {
      id: crypto.randomUUID(),
      text: t('newButtonText'),
      value: 'button_' + (buttons.length + 1),
    };
    const updatePayload: Pick<MessageNodeData, 'buttons'> = {
      buttons: [...buttons, newButton],
    };
    onNodeUpdate(nodeId, updatePayload);
  };

  const handleAddPresetButton = (presetValue: (typeof PRESET_VALUES)[number]['value']) => {
    const newButton: InlineButton = {
      id: crypto.randomUUID(),
      text: t(`presets.${presetValue}`),
      value: presetValue,
    };
    const updatePayload: Pick<MessageNodeData, 'buttons'> = {
      buttons: [...buttons, newButton],
    };
    onNodeUpdate(nodeId, updatePayload);
  };

  const handleRemoveButton = (buttonId: string) => {
    const updated = buttons.filter((b) => b.id !== buttonId);
    const updatePayload: Pick<MessageNodeData, 'buttons'> = {
      buttons: updated,
    };
    onNodeUpdate(nodeId, updatePayload);
  };

  const handleUpdateButton = (buttonId: string, fields: Partial<InlineButton>) => {
    const updated = buttons.map((b) => (b.id === buttonId ? { ...b, ...fields } : b));
    const updatePayload: Pick<MessageNodeData, 'buttons'> = {
      buttons: updated,
    };
    onNodeUpdate(nodeId, updatePayload);
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground flex items-center gap-1 text-[9px] font-medium">
          <LayoutGrid className="size-2.5" /> {t('presetsLabel')}
        </span>
        <div className="flex flex-wrap gap-1">
          {PRESET_VALUES.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleAddPresetButton(preset.value)}
              className="bg-muted/40 hover:bg-muted text-foreground cursor-pointer rounded-sm border px-2 py-0.5 text-[10px] font-medium transition-colors"
            >
              +{t(`presets.${preset.value}`)}
            </button>
          ))}
        </div>
      </div>

      {buttons.length > 0 && (
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {buttons.map((btn) => (
            <div
              key={btn.id}
              className="bg-muted/10 group relative flex flex-col gap-1 rounded-sm border p-2"
            >
              <div className="flex items-center gap-1">
                <Input
                  className="nodrag nowheel h-7 flex-1 px-2 text-[11px]"
                  placeholder={t('newButtonPlaceholder')}
                  value={btn.text}
                  onChange={(e) => handleUpdateButton(btn.id, { text: e.target.value })}
                  onBlur={() => handleUpdateButton(btn.id, { text: btn.text.trim() })}
                />
                <Button
                  variant="ghost"
                  type="button"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 shrink-0 p-0"
                  onClick={() => handleRemoveButton(btn.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
              <Input
                className="nodrag nowheel text-muted-foreground/80 bg-muted/20 h-6 px-2 text-[10px]"
                placeholder={t('variablePlaceholder')}
                value={btn.value}
                onChange={(e) => handleUpdateButton(btn.id, { value: e.target.value.trim() })}
              />
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        type="button"
        className="border-muted-foreground/30 hover:border-muted-foreground/60 h-8 w-full border-dashed text-[11px]"
        onClick={handleAddCustomButton}
      >
        <Plus className="mr-1.5 size-3" />
        {t('customButtonLabel')}
      </Button>
    </div>
  );
}
