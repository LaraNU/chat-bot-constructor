import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/lib/supabase/client';
import { toast } from 'sonner';
import { AuthError } from '@supabase/supabase-js';
import { getAuthErrorKey } from '@/shared/lib/supabase/auth-errors';

type TranslationFn = ReturnType<typeof useTranslations<'SignInForm'>>;

export const createSignInSchema = (t: TranslationFn) =>
  z.object({
    email: z.email(t('errors.emailInvalid')),
    password: z.string().min(8, t('errors.passwordMin')),
  });

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
      const key = err instanceof AuthError ? getAuthErrorKey(err.code) : 'default';
      const message = key === 'default' ? t('errors.default') : t(`errors.${key}`);
      toast.error(message, { position: 'top-center' });
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
