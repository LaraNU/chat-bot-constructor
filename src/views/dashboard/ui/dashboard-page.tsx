import { BotDashboard } from '@/widgets/bot-dashboard';
import { ScopedIntlProvider } from '@/app/providers/scoped-intl-provider';

export function DashboardPage() {
  return (
    <ScopedIntlProvider scopes={['Metadata', 'createBot', 'BotCard', 'HomePage']}>
      <BotDashboard />
    </ScopedIntlProvider>
  );
}
