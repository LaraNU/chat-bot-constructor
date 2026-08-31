'use client';

import { useTranslations } from 'next-intl';

import { useIsDirty, useIsSaving } from '@/entities/workflow/model/store';
import { Button } from '@/shared/ui/button';

import { useSaveWorkflow } from '../model/use-save-workflow';

interface SaveWorkflowButtonProps {
  botId: string;
}

export function SaveWorkflowButton({ botId }: SaveWorkflowButtonProps) {
  const t = useTranslations('WorkflowCanvas');
  const isDirty = useIsDirty();
  const isSaving = useIsSaving();
  const { save } = useSaveWorkflow({ botId });

  let label: string;
  if (isSaving) {
    label = t('savingButton');
  } else if (isDirty) {
    label = t('saveButton');
  } else {
    label = t('savedButton');
  }

  return (
    <Button onClick={save} disabled={!isDirty || isSaving} size="sm" className="shadow-md">
      {label}
    </Button>
  );
}
