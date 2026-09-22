'use client';

import { memo } from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { SaveWorkflowButton } from '@/features/save-workflow';
import { PublishBotButton } from '@/features/publish-bot';
import { cn } from '@/shared/lib/utils';

interface EditorHeaderProps {
  botId: string;
  hasToken: boolean;
  isMobile: boolean;
  onOpenPalette: () => void;
  onOpenProperties: () => void;
}

export const EditorHeader = memo(
  ({ botId, hasToken, isMobile, onOpenPalette, onOpenProperties }: EditorHeaderProps) => {
    const t = useTranslations('WorkflowEditor');

    return (
      <div
        className={cn(
          'z-50 flex items-center justify-center p-4',
          isMobile
            ? 'border-border bg-card w-full border-b'
            : 'bg-card absolute right-[0] rounded-[20px] bg-[#ffffffba]'
        )}
      >
        <div className={cn('flex items-center gap-2', isMobile && 'flex-wrap justify-center')}>
          {isMobile && (
            <>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onOpenPalette}
                aria-label={t('openPaletteButton')}
              >
                <PanelLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onOpenProperties}
                aria-label={t('openPropertiesButton')}
              >
                <PanelRight />
              </Button>
            </>
          )}
          <SaveWorkflowButton botId={botId} />
          <PublishBotButton botId={botId} hasToken={hasToken} />
        </div>
      </div>
    );
  }
);

EditorHeader.displayName = 'EditorHeader';
