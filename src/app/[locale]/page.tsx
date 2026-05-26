import { createClient } from '@/shared/lib/supabase/server';
import { setRequestLocale } from 'next-intl/server';
import { DashboardPage } from '@/views/dashboard';
import { LandingPage } from '@/views/landing';
import { ScopedIntlProvider } from '../providers/scoped-intl-provider';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <ScopedIntlProvider scopes={['Metadata', 'createBot', 'BotCard', 'HomePage']}>
        <DashboardPage />
      </ScopedIntlProvider>
    );
  }

  return <LandingPage />;
}
