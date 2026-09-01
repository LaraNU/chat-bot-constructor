'use client';

import { useCallback, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { validateWorkflow } from '@/entities/workflow';
import type { ValidationResult } from '@/entities/workflow';
import { useIsDirty, useWorkflowEdges, useWorkflowNodes } from '@/entities/workflow/model/store';

import { publishBotAction } from '../api/actions';

type UsePublishBotParams = {
  botId: string;
  hasToken: boolean;
};

export type UsePublishBotReturn = {
  /** Controls the publish dialog. */
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;

  /**
   * 'confirm' — bot already has a stored token; user confirms republish.
   * 'input-token' — first publish; user must enter a token.
   */
  dialogVariant: 'confirm' | 'input-token';

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
   * Opens the dialog only when there are no errors.
   * Shows a toast and populates validationResult on failure.
   */
  openDialog: () => void;

  /**
   * Submits the publish request to the server.
   * In 'input-token' mode the token field must be non-empty.
   * In 'confirm' mode no token is sent — the server uses the stored one.
   */
  publish: () => void;
};

export function usePublishBot({ botId, hasToken }: UsePublishBotParams): UsePublishBotReturn {
  const t = useTranslations('WorkflowCanvas.publishDialog');

  const nodes = useWorkflowNodes();
  const edges = useWorkflowEdges();
  const isDirty = useIsDirty();

  const dialogVariant: 'confirm' | 'input-token' = hasToken ? 'confirm' : 'input-token';

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [token, setToken] = useState('');
  const [isPending, startTransition] = useTransition();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const openDialog = useCallback(() => {
    if (isDirty) {
      toast.warning(t('unsavedChanges'));
      return;
    }

    const result = validateWorkflow({ nodes, edges });

    setValidationResult(result);

    if (!result.isValid) {
      toast.error(t('validationFailed', { count: String(result.errorCount) }));
      return;
    }

    setIsDialogOpen(true);
  }, [isDirty, nodes, edges, t]);

  const publish = useCallback(() => {
    if (dialogVariant === 'input-token' && !token.trim()) {
      toast.error(t('tokenRequired'));
      return;
    }

    const payload = dialogVariant === 'input-token' ? { botId, token: token.trim() } : { botId };

    startTransition(async () => {
      const result = await publishBotAction(payload);

      if (result.success) {
        toast.success(t('publishSuccess'));
        setIsDialogOpen(false);
        setValidationResult(null);
      } else {
        const message =
          result.error === 'token_required'
            ? t('tokenRequired')
            : (result.error ?? t('publishError'));
        toast.error(message);
      }
    });
  }, [dialogVariant, token, botId, t]);

  return {
    isDialogOpen,
    setIsDialogOpen,
    dialogVariant,
    token,
    setToken,
    isPending,
    validationResult,
    openDialog,
    publish,
  };
}
