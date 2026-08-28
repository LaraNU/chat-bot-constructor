'use client';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field';
import { Controller } from 'react-hook-form';
import { Spinner } from '@/shared/ui/spinner';
import { useSignUp } from '../model/use-sign-up';

export function SignUpForm() {
  const { form, onSubmit, isLoading, t } = useSignUp();

  return (
    <form id="sign-up-form" onSubmit={onSubmit}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="user-name">{t('nameLabel')}</FieldLabel>
              <Input
                {...field}
                id="user-name"
                data-testid="user-name-input"
                placeholder={t('namePlaceholder')}
                autoComplete="off"
                disabled={isLoading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="user-email">{t('emailLabel')}</FieldLabel>
              <Input
                {...field}
                id="user-email"
                data-testid="user-email-input"
                placeholder={t('emailPlaceholder')}
                autoComplete="off"
                disabled={isLoading}
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
                data-testid="user-password-input"
                placeholder={t('passwordPlaceholder')}
                autoComplete="off"
                disabled={isLoading}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          form="sign-up-form"
          disabled={isLoading}
          data-testid="submit-sign-up-form"
        >
          {isLoading && <Spinner data-icon="inline-start" />}
          {t('submit')}
        </Button>
      </FieldGroup>
    </form>
  );
}
