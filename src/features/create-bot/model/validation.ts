import * as z from 'zod';
import { useTranslations } from 'next-intl';

type TranslationFn = ReturnType<typeof useTranslations<'createBot'>>;

export const createBotSchema = (t: TranslationFn) =>
  z.object({
    name: z.string().min(3, t('errors.nameMin')).max(32, t('errors.nameMax')),
    description: z.string().max(100, t('errors.descMax')),
  });

export type FormInputs = z.infer<ReturnType<typeof createBotSchema>>;
