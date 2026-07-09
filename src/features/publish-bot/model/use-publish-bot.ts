'use client';

import { useCallback, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { validateWorkflow } from '@/entities/workflow';
import type { ValidationResult } from '@/entities/workflow';
import { useWorkflowEdges, useWorkflowNodes } from '@/entities/workflow/model/store';

import { publishBotAction } from '../api/actions';

type UsePublishBotParams = {
  botId: string;
  initialToken?: string | null;
};

export type UsePublishBotReturn = {
  /** Controls the Telegram token dialog. */
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;

  token: string;
  setToken: (token: string) => void;

  /** True while the server action is in flight. */
  isPending: boolean;

  /**
   * Last validation result. Populated after openDialog() is called.
   * Null until the user attempts to publish.
   */
  validationResult: ValidationResult | null;

  /**
   * Validates the current workflow graph.
   * Opens the token dialog only when there are no errors.
   * Shows a toast and populates validationResult on failure.
   */
  openDialog: () => void;

  /**
   * Submits the publish request to the server.
   * Should only be called when the dialog is open and a token is set.
   */
  publish: () => void;
};

export function usePublishBot({ botId, initialToken }: UsePublishBotParams): UsePublishBotReturn {
  const t = useTranslations('WorkflowCanvas.publishDialog');

  const nodes = useWorkflowNodes();
  const edges = useWorkflowEdges();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [token, setToken] = useState(initialToken ?? '');
  const [isPending, startTransition] = useTransition();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const openDialog = useCallback(() => {
    const result = validateWorkflow({ nodes, edges });

    setValidationResult(result);

    if (!result.isValid) {
      toast.error(t('validationFailed', { count: String(result.errorCount) }));
      return;
    }

    setIsDialogOpen(true);
  }, [nodes, edges, t]);

  const publish = useCallback(() => {
    if (!token.trim()) {
      toast.error(t('tokenRequired'));
      return;
    }

    startTransition(async () => {
      const result = await publishBotAction({ botId, token: token.trim() });

      if (result.success) {
        toast.success(t('publishSuccess'));
        setIsDialogOpen(false);
        setValidationResult(null);
      } else {
        toast.error(result.error ?? t('publishError'));
      }
    });
  }, [token, botId, t]);

  return {
    isDialogOpen,
    setIsDialogOpen,
    token,
    setToken,
    isPending,
    validationResult,
    openDialog,
    publish,
  };
}
