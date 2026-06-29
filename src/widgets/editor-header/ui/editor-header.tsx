'use client';

import { memo } from 'react';
import { SaveWorkflowButton } from '@/features/save-workflow';
import { PublishBotButton } from '@/features/publish-bot';

interface EditorHeaderProps {
  botId: string;
  initialToken?: string | null;
}

export const EditorHeader = memo(({ botId, initialToken }: EditorHeaderProps) => {
  return (
    <div className="bg-card absolute right-[0] z-50 flex items-center justify-between rounded-[20px] bg-[#ffffffba] p-4">
      <div className="flex items-center gap-2">
        <SaveWorkflowButton botId={botId} />
        <PublishBotButton botId={botId} initialToken={initialToken} />
      </div>
    </div>
  );
});

EditorHeader.displayName = 'EditorHeader';
