'use client';

import { useTranslations } from 'next-intl';
import { Rocket } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Spinner } from '@/shared/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

import { usePublishBot } from '../model/use-publish-bot';

interface PublishBotButtonProps {
  botId: string;
  hasToken: boolean;
}

export function PublishBotButton({ botId, hasToken }: PublishBotButtonProps) {
  const t = useTranslations('WorkflowCanvas.publishDialog');

  const {
    isDialogOpen,
    setIsDialogOpen,
    dialogVariant,
    token,
    setToken,
    isPending,
    openDialog,
    publish,
  } = usePublishBot({ botId, hasToken });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button variant="outline" onClick={openDialog}>
        <Rocket className="mr-1.5 size-3.5" />
        {t('publishBtn')}
      </Button>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('publishTitle')}</DialogTitle>
          <DialogDescription>
            {dialogVariant === 'confirm' ? t('confirmDescription') : t('publishDescription')}
          </DialogDescription>
        </DialogHeader>

        {dialogVariant === 'input-token' && (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tg-token" className="text-xs font-semibold">
                Telegram Bot Token
              </Label>
              <Input
                id="tg-token"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={token}
                disabled={isPending}
                onChange={(e) => setToken(e.target.value)}
                className="h-9 text-xs"
                autoComplete="off"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(false)}
            disabled={isPending}
          >
            {t('cancelBtn')}
          </Button>
          <Button size="sm" onClick={publish} disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {dialogVariant === 'confirm' ? t('confirmPublishBtn') : t('launchBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
