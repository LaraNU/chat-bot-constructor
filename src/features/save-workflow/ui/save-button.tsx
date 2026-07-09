'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';

import { useSaveWorkflow } from '../model/use-save-workflow';

interface SaveWorkflowButtonProps {
  botId: string;
}

export function SaveWorkflowButton({ botId }: SaveWorkflowButtonProps) {
  const t = useTranslations('WorkflowCanvas');
  const { isLoading, save } = useSaveWorkflow({ botId });

  return (
    <Button onClick={save} disabled={isLoading} size="sm" className="shadow-md">
      {isLoading ? t('savingButton') : t('saveButton')}
    </Button>
  );
}
