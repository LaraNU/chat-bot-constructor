import { useTranslations } from 'next-intl';
import { CreateBotModal } from '@/features/create-bot';
import { BotList } from '@/widgets/bot-list';
import { BotListFallback } from '@/widgets/bot-list';
import { Suspense } from 'react';

export function BotDashboard() {
  const t = useTranslations('HomePage');

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 data-testid="title-for-auth" className="text-2xl font-semibold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
          </div>
          <CreateBotModal />
        </div>

        <Suspense fallback={<BotListFallback />}>
          <BotList />
        </Suspense>
      </main>
    </div>
  );
}
