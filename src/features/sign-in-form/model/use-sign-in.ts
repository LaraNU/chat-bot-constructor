import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/lib/supabase/client';
import { toast } from 'sonner';
import { AuthError } from '@supabase/supabase-js';

type TranslationFn = ReturnType<typeof useTranslations<'SignInForm'>>;

export const createSignInSchema = (t: TranslationFn) =>
  z.object({
    email: z.email(t('errors.emailInvalid')),
    password: z.string().min(8, t('errors.passwordMin')),
  });

export const getAuthErrorMessage = (code: string | undefined, t: TranslationFn): string => {
  const errorMap: Record<string, string> = {
    invalid_credentials: t('errors.invalid_credentials'),
    email_not_confirmed: t('errors.email_not_confirmed'),
    user_not_found: t('errors.user_not_found'),
    too_many_requests: t('errors.too_many_requests'),
  };

  return (code && errorMap[code]) || t('errors.default');
};

export type SignInFields = z.infer<ReturnType<typeof createSignInSchema>>;

export const useSignIn = () => {
  const t = useTranslations('SignInForm');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<SignInFields>({
    resolver: zodResolver(createSignInSchema(t)),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: SignInFields) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      toast.success(t('success'));
    } catch (err) {
      const message =
        err instanceof AuthError ? getAuthErrorMessage(err.code, t) : t('errors.unexpected');
      toast.error(message, { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    t,
  };
};
