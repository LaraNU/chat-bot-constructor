'use client';

import { useCallback } from 'react';
import type { InlineButton, MessageNodeData } from '@/entities/workflow/model/types';

interface UseNodeButtonsProps {
  nodeId: string;
  buttons: InlineButton[];
  onUpdate: (nodeId: string, data: Partial<MessageNodeData>) => void;
  translateNewButton: string;
  translatePreset: (key: string) => string;
}

export function useNodeButtons({
  nodeId,
  buttons,
  onUpdate,
  translateNewButton,
  translatePreset,
}: UseNodeButtonsProps) {
  const handleAddCustomButton = useCallback(() => {
    const newButton: InlineButton = {
      id: crypto.randomUUID(),
      text: translateNewButton,
      value: 'button_' + (buttons.length + 1),
    };
    onUpdate(nodeId, { buttons: [...buttons, newButton] });
  }, [nodeId, buttons, onUpdate, translateNewButton]);

  const handleAddPresetButton = useCallback(
    (presetValue: string) => {
      const newButton: InlineButton = {
        id: crypto.randomUUID(),
        text: translatePreset(presetValue),
        value: presetValue,
      };
      onUpdate(nodeId, { buttons: [...buttons, newButton] });
    },
    [nodeId, buttons, onUpdate, translatePreset]
  );

  const handleRemoveButton = useCallback(
    (buttonId: string) => {
      onUpdate(nodeId, { buttons: buttons.filter((b) => b.id !== buttonId) });
    },
    [nodeId, buttons, onUpdate]
  );

  const handleUpdateButton = useCallback(
    (buttonId: string, fields: Partial<InlineButton>) => {
      const updated = buttons.map((b) => (b.id === buttonId ? { ...b, ...fields } : b));
      onUpdate(nodeId, { buttons: updated });
    },
    [nodeId, buttons, onUpdate]
  );

  return {
    handleAddCustomButton,
    handleAddPresetButton,
    handleRemoveButton,
    handleUpdateButton,
  };
}
