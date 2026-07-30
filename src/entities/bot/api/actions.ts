'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { botService } from '../server/service';
import { getBotStatus, type BotStatus } from '../model/types';
import { revalidatePath } from 'next/cache';

export interface SerializedBot {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  status: BotStatus;
}

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

    revalidatePath('/', 'page');

    return { success: true, data: newBot };
  } catch (error) {
    console.error('Error Server Action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create bot',
    };
  }
}

export async function fetchBotsAction(limit: number, offset: number): Promise<SerializedBot[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const bots = await botService.getPaginatedBots(user.id, limit, offset);

    return bots.map((bot) => ({
      id: bot.id,
      name: bot.name,
      description: bot.description,
      updatedAt: bot.updatedAt.toISOString(),
      status: getBotStatus({
        token: bot.token,
        flowUpdatedAt: bot.flow?.updatedAt ?? null,
        snapshotCreatedAt: bot.flow?.snapshot?.createdAt ?? null,
      }),
    }));
  } catch (error) {
    console.error('Error Server Action:', error);
    throw error;
  }
}

export async function deleteBotAction(botId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    await botService.assertBotOwnership(user.id, botId);
    await botService.deleteBot(botId);

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Error Server Action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete bot',
    };
  }
}
