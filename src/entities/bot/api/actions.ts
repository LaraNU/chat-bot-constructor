'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { botService } from '../server/service';
import { revalidatePath } from 'next/cache';

export async function createBotAction(formData: { name: string; description: string }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const newBot = await botService.createNewBot({
      ...formData,
      userId: user.id,
    });

    revalidatePath('/[locale]/dashboard', 'page');

    return { success: true, data: newBot };
  } catch (error) {
    console.error('❌ Ошибка Server Action при создании бота:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Не удалось создать бота',
    };
  }
}
