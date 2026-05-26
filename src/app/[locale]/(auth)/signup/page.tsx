import { ScopedIntlProvider } from '@/app/providers/scoped-intl-provider';
import { SignUpPage } from '@/views/sing-up';

export default async function SignupPage() {
  return (
    <ScopedIntlProvider scopes={['SignUpPage', 'SignUpForm']}>
      <SignUpPage />
    </ScopedIntlProvider>
  );
}
