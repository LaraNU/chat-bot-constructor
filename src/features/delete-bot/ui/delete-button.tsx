'use client';

import { Trash } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export function DeleteBotButton({ botId }: { botId: string }) {
  const handleDelete = async () => {
    if (confirm('Удалить этого бота?')) {
      console.log(`Бот с ID ${botId} удалён`); // Здесь должна быть логика удаления бота через API
      // Например:
      // await botService.deleteBot(botId);
      // После удаления можно показать уведомление и обновить список ботов
    }
  };

  return (
    <Button variant="secondary" size="sm" className="flex-1" onClick={handleDelete}>
      <Trash className="mr-2 h-3.5 w-3.5" />
      Удалить
    </Button>
  );
}
