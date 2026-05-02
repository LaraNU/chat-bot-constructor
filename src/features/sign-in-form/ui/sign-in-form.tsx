'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { Controller } from 'react-hook-form';
import { Spinner } from '@/shared/ui/spinner';
import { useSignIn } from '../model/use-sign-in';

export function SignInForm() {
  const { form, onSubmit, isLoading, t } = useSignIn();

  return (
    <form id="sign-in-form" onSubmit={onSubmit}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
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
          control={form.control}
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
