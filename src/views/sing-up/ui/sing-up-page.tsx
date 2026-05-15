import { getTranslations } from 'next-intl/server';
import { SignUpForm } from '@/features/sign-up-form';
import { Link } from '@/i18n/navigation';

export async function SignUpPage() {
  const t = await getTranslations('SignUpPage');

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('description')}</p>
        </div>

        <SignUpForm />

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-foreground font-medium hover:underline">
            {t('signInLink')}
          </Link>
        </p>
      </div>
    </main>
  );
}
