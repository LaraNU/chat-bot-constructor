'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { saveWorkflowAction, validateWorkflow } from '@/entities/workflow';
import { useMarkClean, useSetSaving, useWorkflowStoreApi } from '@/entities/workflow/model/store';

type UseSaveWorkflowParams = {
  botId: string;
  /** When true, suppresses toast notifications (used by autosave). */
  silent?: boolean;
};

export type UseSaveWorkflowReturn = {
  save: () => Promise<void>;
};

/**
 * Owns the full save lifecycle:
 * 1. Guards against concurrent saves using isSaving from the store.
 * 2. Reads fresh nodes/edges from store.getState() at call time (not from render closure).
 * 3. Validates the current workflow graph (non-blocking — save proceeds regardless).
 * 4. Calls saveWorkflowAction and shows toasts unless silent=true.
 */
export function useSaveWorkflow({
  botId,
  silent = false,
}: UseSaveWorkflowParams): UseSaveWorkflowReturn {
  const t = useTranslations('WorkflowCanvas');
  const markClean = useMarkClean();
  const setSaving = useSetSaving();
  const storeApi = useWorkflowStoreApi();

  const save = useCallback(async () => {
    // Read fresh state at call time — avoids stale closure and prevents isSaving
    // from being a useCallback dep (which would reset the autosave timer on every save).
    const { isSaving, nodes, edges } = storeApi.getState();
    if (isSaving) return;

    const validation = validateWorkflow({ nodes, edges });

    setSaving(true);
    try {
      const result = await saveWorkflowAction({ botId, nodes, edges });

      if (result.success) {
        markClean();
        if (!silent) {
          if (validation.isValid) {
            toast.success(t('messages.saveSuccess'));
          } else {
            toast.warning(t('messages.saveWithErrors', { count: String(validation.errorCount) }));
          }
        }
      } else if (!silent) {
        toast.error(result.error ?? t('messages.saveError'));
      }
    } catch {
      if (!silent) {
        toast.error(t('messages.saveError'));
      }
    } finally {
      setSaving(false);
    }
  }, [storeApi, botId, markClean, setSaving, silent, t]);

  return { save };
}
