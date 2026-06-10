'use client';

import { Trash } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useTransition } from 'react';
import { deleteBotAction } from '@/entities/bot/actions';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Trash2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface DeleteBotButtonProps {
  botId: string;
  onSuccess?: () => void;
}

export function DeleteBotButton({ botId, onSuccess }: DeleteBotButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations('BotCard');

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteBotAction(botId);

      if (result.success) {
        toast.success(t('deleteSuccess'));
        if (onSuccess) {
          onSuccess();
        }
        router.refresh();
      } else {
        toast.error(result.error || t('deleteError'));
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" size="sm" className="flex-1">
          <Trash className="mr-2 h-3.5 w-3.5" />
          {t('deleteBtn')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('deleteConfirmation')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">{t('cancelBtn')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isPending}>
            {t('deleteBtn')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
