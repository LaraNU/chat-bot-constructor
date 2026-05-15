import { botService } from '@/entities/bot/server/service';
import { BotCard } from '@/entities/bot';
import { DeleteBotButton } from '@/features/delete-bot';
import { createClient } from '@/shared/lib/supabase/server';

export const BotList = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const bots = await botService.getAllBots(user.id);

  if (!bots || bots.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">У вас пока нет ботов</div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bots.map((bot) => (
        <BotCard
          key={bot.id}
          id={bot.id}
          name={bot.name}
          updatedAt={bot.updatedAt.toISOString()}
          description={bot.description}
          deleteActionSlot={<DeleteBotButton botId={bot.id} />}
        />
      ))}
    </div>
  );
};
