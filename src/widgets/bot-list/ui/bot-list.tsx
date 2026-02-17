import { botService } from '@/entities/bot/server/service';
import { BotCard } from '@/features/bot-card';
import { createClient } from '@/shared/lib/supabase/server';

export const BotList = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const bots = await botService.getAllBots(user.id);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bots &&
        bots.map((bot) => (
          <BotCard
            key={bot.id}
            id={bot.id}
            name={bot.name}
            lastUpdated={bot.updatedAt.toLocaleString()}
            description={bot.description}
          />
        ))}
    </div>
  );
};
