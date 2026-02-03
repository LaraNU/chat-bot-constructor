import { useTranslations } from 'next-intl';
import { Card, CardHeader } from '@/shared/ui/card';
import { CreateBotModal } from '@/features/create-bot';

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
          </div>
          <CreateBotModal />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group hover:border-foreground/20 relative overflow-hidden transition-all hover:shadow-md">
            <CardHeader>{t('botCardTitle')}</CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
