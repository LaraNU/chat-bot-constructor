'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { createBotAction } from '@/entities/bot';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Spinner } from '@/shared/ui/spinner';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/shared/ui/input-group';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

import { createBotSchema, type FormInputs } from '../model/validation';

export function CreateBotModal() {
  const t = useTranslations('createBot');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { handleSubmit, control, reset } = useForm<FormInputs>({
    resolver: zodResolver(createBotSchema(t)),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const descriptionValue = useWatch({
    control,
    name: 'description',
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) reset();
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    startTransition(async () => {
      const result = await createBotAction(data);
      if (result.success && result.data) {
        setIsOpen(false);
        reset();
        router.push(`/editor/${result.data.id}`);
      } else {
        toast.error(result.error || t('errors.createFailed'));
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" data-testid="open-create-bot-modal">
          <Plus className="mr-2 h-4 w-4" />
          {t('trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form id="form-create-bot" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <DialogHeader>
              <DialogTitle data-testid="create-bot-modal-title">{t('trigger')}</DialogTitle>
              <DialogDescription>{t('createBotDescription')}</DialogDescription>
            </DialogHeader>

            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-bot-name">{t('nameLabel')}</FieldLabel>
                  <Input
                    {...field}
                    data-testid="bot-name-input"
                    id="create-bot-name"
                    placeholder={t('namePlaceholder')}
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-bot-description">{t('descLabel')}</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      data-testid="bot-description-input"
                      id="create-bot-description"
                      rows={6}
                      className="min-h-24 resize-none"
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {(descriptionValue || '').length}/100 {t('chars')}
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending}>
                  {t('btnClose')}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form="form-create-bot"
                disabled={isPending}
                data-testid="submit-create-bot-modal"
              >
                {isPending && <Spinner data-icon="inline-start" />}
                {t('btnSave')}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
