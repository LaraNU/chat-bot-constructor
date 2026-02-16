'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Spinner } from '@/shared/ui/spinner';
import { createClient } from '@/shared/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { AuthError } from '@supabase/supabase-js';

type FormInputs = {
  email: string;
  password: string;
};

export function SignInForm() {
  const t = useTranslations('SignInForm');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const formSchema = z.object({
    email: z.email(t('errors.emailInvalid')),
    password: z.string().min(8, t('errors.passwordMin')),
  });

  const { handleSubmit, control } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FormInputs> = async ({ email, password }) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err) {
      if (err instanceof AuthError) {
        const errorMessage = getErrorMessage(err.code);

        toast.error(errorMessage, { position: 'top-center' });
      } else {
        toast.error(t('errors.unexpected'), { position: 'top-center' });
      }
    }

    setIsLoading(false);
  };

  const getErrorMessage = (code: string | undefined) => {
    switch (code) {
      case 'invalid_credentials':
        return t('errors.invalid_credentials');
      case 'email_not_confirmed':
        return t('errors.email_not_confirmed');
      case 'user_not_found':
        return t('errors.user_not_found');
      case 'too_many_requests':
        return t('errors.too_many_requests');
      default:
        return t('errors.default');
    }
  };

  return (
    <form id="sign-in-form" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="user-email">{t('emailLabel')}</FieldLabel>
              <Input
                {...field}
                id="user-email"
                data-testid="user-email-input-login"
                placeholder={t('emailPlaceholder')}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="user-password">{t('passwordLabel')}</FieldLabel>
              <Input
                {...field}
                id="user-password"
                type="password"
                data-testid="user-password-input-login"
                placeholder={t('passwordPlaceholder')}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          form="sign-in-form"
          disabled={isLoading}
          data-testid="submit-sign-in-form-login"
        >
          {isLoading && <Spinner data-icon="inline-start" />}
          {t('submit')}
        </Button>
      </FieldGroup>
    </form>
  );
}
