'use client';

import { useEffect, useState } from 'react';

import { useIsDirty, useIsSaving } from '@/entities/workflow/model/store';

import { useSaveWorkflow } from './use-save-workflow';

type UseAutosaveParams = {
  botId: string;
};

const AUTOSAVE_DELAY_MS = 2000;

const INPUT_SELECTOR = 'input, textarea';

/**
 * Triggers a silent save 2 seconds after the last graph change.
 * - Pauses while a save is already in progress.
 * - Pauses while the user has focus inside an input or textarea (typing).
 *   The timer starts only after focus leaves the input.
 * Must be mounted inside WorkflowStoreProvider.
 */
export function useAutosave({ botId }: UseAutosaveParams): void {
  const isDirty = useIsDirty();
  const isSaving = useIsSaving();
  const { save } = useSaveWorkflow({ botId, silent: true });

  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if (e.target instanceof Element && e.target.matches(INPUT_SELECTOR)) {
        setIsInputFocused(true);
      }
    };
    const handleFocusOut = (e: FocusEvent) => {
      if (e.target instanceof Element && e.target.matches(INPUT_SELECTOR)) {
        setIsInputFocused(false);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  useEffect(() => {
    if (!isDirty || isSaving || isInputFocused) return;

    const timer = setTimeout(() => {
      save();
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isDirty, isSaving, isInputFocused, save]);
}
