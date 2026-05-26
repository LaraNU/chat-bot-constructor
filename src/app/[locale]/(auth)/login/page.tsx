import { SignInPage } from '@/views/login';
import { ScopedIntlProvider } from '@/app/providers/scoped-intl-provider';

export default async function LoginPage() {
  return (
    <ScopedIntlProvider scopes={['SignInPage', 'SignInForm']}>
      <SignInPage />
    </ScopedIntlProvider>
  );
}
