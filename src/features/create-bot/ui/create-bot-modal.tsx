'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
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
import { Input } from '@/shared/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/shared/ui/input-group';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { createNewBot } from '@/entities/bot/api/bots';
import { useState } from 'react';
import { Spinner } from '@/shared/ui/spinner';

type FormInputs = {
  name: string;
  description: string;
};

export function CreateBotModal() {
  const t = useTranslations('createBot');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(3, t('errors.nameMin')).max(32, t('errors.nameMax')),
    description: z.string().max(100, t('errors.descMax')),
  });

  const { handleSubmit, control, reset } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      reset();
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async ({ name, description }) => {
    setIsLoading(true);
    try {
      const newBot = await createNewBot({ name, description });
      router.push(`/editor/${newBot.id}`);
    } finally {
      setIsLoading(false);
    }
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
                        {field.value.length}/100 {t('chars')}
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('btnClose')}</Button>
              </DialogClose>
              <Button
                type="submit"
                form="form-create-bot"
                disabled={isLoading}
                data-testid="submit-create-bot-modal"
              >
                {isLoading && <Spinner data-icon="inline-start" />}
                {t('btnSave')}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
