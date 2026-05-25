'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { SaveWorkflowButton } from '@/features/save-workflow';

interface EditorHeaderProps {
  botId: string;
}

export const EditorHeader = memo(({ botId }: EditorHeaderProps) => {
  const t = useTranslations('WorkflowEditor');

  return (
    <div className="border-border bg-card flex items-center justify-between border-b p-4">
      <h2 className="text-sm font-medium">
        {t('title')} {botId}
      </h2>
      <SaveWorkflowButton botId={botId} />
    </div>
  );
});

EditorHeader.displayName = 'EditorHeader';
