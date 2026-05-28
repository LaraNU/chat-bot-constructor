'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
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
  DialogTrigger,
} from '@/shared/ui/dialog';
import { publishBotAction } from '../api/actions';

interface PublishBotButtonProps {
  botId: string;
  initialToken?: string | null;
}

export function PublishBotButton({ botId, initialToken }: PublishBotButtonProps) {
  const t = useTranslations('WorkflowCanvas.publishDialog');
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(initialToken || '');
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    if (!token.trim()) {
      toast.error('Please enter a valid Bot Token');
      return;
    }

    startTransition(async () => {
      const result = await publishBotAction({ botId, token: token.trim() });

      if (result.success) {
        toast.success(t('publishSuccess'));
        setIsOpen(false);
      } else {
        toast.error(result.error || t('publishError'));
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Rocket className="mr-1.5 size-3.5" />
          {t('publishBtn')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('publishTitle')}</DialogTitle>
          <DialogDescription>{t('publishDescription')}</DialogDescription>
        </DialogHeader>

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

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={isPending}>
            {t('cancelBtn')}
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {t('launchBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
