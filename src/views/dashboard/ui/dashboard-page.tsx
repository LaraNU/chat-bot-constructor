import { CreateBotModal } from '@/features/create-bot';
import { BotList } from '@/widgets/bot-list';
import { BotListFallback } from '@/widgets/bot-list';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Heading } from '@/shared/ui/typography/heading';

export async function DashboardPage() {
  const t = await getTranslations('HomePage');

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Heading level={2}>{t('title')}</Heading>
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
