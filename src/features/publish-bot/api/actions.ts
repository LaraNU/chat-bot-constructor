'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { prisma } from '@/shared/lib/prisma';
import { UnauthorizedError } from '@/shared/api/errors';
import { publishBotSchema } from '../lib/validation';
import { setTelegramWebhook } from '../lib/telegram';
import type { PublishBotPayload, ActionResponse } from '../model/types';

export async function publishBotAction(payload: PublishBotPayload): Promise<ActionResponse> {
  const validation = publishBotSchema.safeParse(payload);

  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    const errorMessage = firstIssue ? firstIssue.message : 'Invalid input data';

    return {
      success: false,
      error: errorMessage,
    };
  }

  const { botId, token } = validation.data;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError();
    }

    await setTelegramWebhook(token, botId);

    await prisma.bot.update({
      where: { id: botId, userId: user.id },
      data: { token },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish bot',
    };
  }
}
