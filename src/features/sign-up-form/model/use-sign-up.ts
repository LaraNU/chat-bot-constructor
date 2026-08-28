import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { createClient } from '@/shared/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { AuthError } from '@supabase/supabase-js';
import { getAuthErrorKey } from '@/shared/lib/supabase/auth-errors';

type TranslationFn = ReturnType<typeof useTranslations<'SignUpForm'>>;

export const createSignUpSchema = (t: TranslationFn) =>
  z.object({
    name: z.string().min(3, t('errors.nameMin')),
    email: z.email(t('errors.emailInvalid')),
    password: z.string().min(8, t('errors.passwordMin')),
  });

export type SignUpFields = z.infer<ReturnType<typeof createSignUpSchema>>;

export const useSignUp = () => {
  const t = useTranslations('SignUpForm');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const form = useForm<SignUpFields>({
    resolver: zodResolver(createSignUpSchema(t)),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: SignUpFields) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { display_name: data.name },
        },
      });

      if (error) throw error;

      toast.success(t('success'));
      try {
        router.push('/');
        // isLoading intentionally stays true — component unmounts on navigation.
      } catch {
        // Navigation failed (network loss, router error); unblock the form.
        setIsLoading(false);
      }
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
