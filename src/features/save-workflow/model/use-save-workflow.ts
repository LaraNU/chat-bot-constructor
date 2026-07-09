'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { saveWorkflowAction, validateWorkflow } from '@/entities/workflow';
import { useMarkClean, useWorkflowEdges, useWorkflowNodes } from '@/entities/workflow/model/store';

type UseSaveWorkflowParams = {
  botId: string;
};

export type UseSaveWorkflowReturn = {
  isLoading: boolean;
  save: () => Promise<void>;
};

/**
 * Owns the full save lifecycle:
 * 1. Validates the current workflow graph (non-blocking — save proceeds regardless).
 * 2. Calls saveWorkflowAction and shows a single toast:
 *    - success when the graph is valid
 *    - warning when saved but validation errors exist
 *
 * Validation is intentionally non-blocking here because save is a draft operation.
 * Publish is where errors become a hard gate (see usePublishBot).
 */
export function useSaveWorkflow({ botId }: UseSaveWorkflowParams): UseSaveWorkflowReturn {
  const t = useTranslations('WorkflowCanvas');
  const nodes = useWorkflowNodes();
  const edges = useWorkflowEdges();
  const markClean = useMarkClean();
  const [isLoading, setIsLoading] = useState(false);

  const save = useCallback(async () => {
    const validation = validateWorkflow({ nodes, edges });

    setIsLoading(true);
    try {
      const result = await saveWorkflowAction({ botId, nodes, edges });

      if (result.success) {
        markClean();
        if (validation.isValid) {
          toast.success(t('messages.saveSuccess'));
        } else {
          toast.warning(t('messages.saveWithErrors', { count: String(validation.errorCount) }));
        }
      } else {
        toast.error(result.error ?? t('messages.saveError'));
      }
    } catch {
      toast.error(t('messages.saveError'));
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, botId, markClean, t]);

  return { isLoading, save };
}
