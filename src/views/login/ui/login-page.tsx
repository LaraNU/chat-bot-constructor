import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SignInForm } from '@/features/sign-in-form';

export async function SignInPage() {
  const t = await getTranslations('SignInPage');

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('description')}</p>
        </div>

        <SignInForm />

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t('noAccount')}{' '}
          <Link
            href="/signup"
            className="text-foreground font-medium hover:underline"
            data-testid="signup-link"
          >
            {t('signUpLink')}
          </Link>
        </p>
      </div>
    </main>
  );
}
