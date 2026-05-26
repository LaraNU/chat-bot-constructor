import { botService } from '@/entities/bot/server/service';
import { createClient } from '@/shared/lib/supabase/server';
import { InfiniteBotList, BOTS_PER_PAGE } from '@/entities/bot';
import { getTranslations } from 'next-intl/server';

export const BotList = async () => {
  const t = await getTranslations('HomePage');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const initialBots = await botService.getPaginatedBots(user.id, BOTS_PER_PAGE, 0);

  if (!initialBots || initialBots.length === 0) {
    return <div className="text-muted-foreground py-8 text-center text-sm">{t('emptyState')}</div>;
  }

  const serializedBots = initialBots.map((bot) => ({
    id: bot.id,
    name: bot.name,
    description: bot.description,
    updatedAt: bot.updatedAt.toISOString(),
  }));

  return <InfiniteBotList initialBots={serializedBots} limit={BOTS_PER_PAGE} />;
};
