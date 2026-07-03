'use client';

import { memo, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';

import type { ChoiceButton } from '../../model/types';
import { CommitInput } from '../nodes/fields/commit-input';

interface ChoiceButtonsEditorProps {
  buttons?: ChoiceButton[];
  onUpdate: (buttons: ChoiceButton[]) => void;
}

function ChoiceButtonsEditor({ buttons = [], onUpdate }: ChoiceButtonsEditorProps) {
  const t = useTranslations('WorkflowEditor.nodes.choice');

  const addButton = useCallback(() => {
    onUpdate([
      ...buttons,
      {
        id: nanoid(),
        text: '',
      },
    ]);
  }, [buttons, onUpdate]);

  const removeButton = (buttonId: string) => {
    onUpdate(buttons.filter((button) => button.id !== buttonId));
  };

  const updateButtonText = useCallback(
    (buttonId: string, text: string) => {
      onUpdate(
        buttons.map((button) =>
          button.id === buttonId
            ? {
                ...button,
                text,
              }
            : button
        )
      );
    },
    [buttons, onUpdate]
  );

  return (
    <div className="space-y-2">
      {buttons.map((button) => (
        <div key={button.id} className="flex items-center gap-2">
          <CommitInput
            value={button.text}
            placeholder={t('buttonTextPlaceholder')}
            onCommit={(text) => updateButtonText(button.id, text)}
          />

          <Button type="button" size="icon" variant="ghost" onClick={() => removeButton(button.id)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button type="button" size="sm" variant="outline" className="w-full" onClick={addButton}>
        <Plus className="mr-2 size-4" />
        {t('addButton')}
      </Button>
    </div>
  );
}

export const ChoiceButtonsEditorMemoized = memo(ChoiceButtonsEditor);
