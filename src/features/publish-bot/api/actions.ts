'use server';

import { headers } from 'next/headers';
import { createClient } from '@/shared/lib/supabase/server';
import { UnauthorizedError } from '@/shared/api/errors';
import { prisma } from '@/shared/lib/prisma';
import { assertMutationRateLimit } from '@/shared/lib/rate-limit';
import { botService } from '@/entities/bot/server';
import { encryptToken, decryptToken, isEncryptedToken } from '@/shared/lib/crypto';
import { publishBotSchema } from '../lib/validation';
import { setTelegramWebhook } from '../lib/telegram';
import type { PublishBotPayload, ActionResponse } from '../model/types';

export async function publishBotAction(payload: PublishBotPayload): Promise<ActionResponse> {
  const validation = publishBotSchema.safeParse(payload);

  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    const errorMessage = firstIssue ? firstIssue.message : 'Invalid input data';

    return { success: false, error: errorMessage };
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

    assertMutationRateLimit(user.id);

    // Ownership must be verified before any external side effect — otherwise a request
    // carrying someone else's botId would still register a live Telegram webhook before
    // the ownership check (previously only enforced inside the DB transaction) had a chance to reject it.
    const bot = await botService.assertBotOwnership(user.id, botId);

    // Resolve the plaintext token: use the submitted one or read/decrypt the stored one.
    // Legacy bots (pre-migration) may still have a plaintext token — handle both formats
    // during the migration window; run scripts/encrypt-tokens.ts to encrypt them all at once.
    let plaintextToken: string;
    if (token) {
      plaintextToken = token;
    } else if (bot.token) {
      plaintextToken = isEncryptedToken(bot.token) ? decryptToken(bot.token) : bot.token;
    } else {
      return { success: false, error: 'token_required' };
    }

    const headersList = await headers();
    const host = headersList.get('host');
    const protocol =
      host?.startsWith('localhost') || host?.startsWith('127.0.0.1') ? 'http' : 'https';

    const appUrl = host
      ? `${protocol}://${host}`
      : process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}`;

    // External call first: if Telegram registration fails, nothing is written to DB.
    // If the DB transaction below fails, the user can safely retry — setWebhook is idempotent.
    const secretToken = botService.getWebhookSecret(botId);
    await setTelegramWebhook(plaintextToken, botId, appUrl, secretToken);

    // Atomic: Bot.token and FlowSnapshot are committed together.
    // Flow is read inside the transaction to eliminate the race condition window between
    // reading the draft and a concurrent saveWorkflowAction updating it.
    // Direct tx.* calls are required — existing repositories use the module-level prisma
    // client and cannot participate in an external interactive transaction.
    await prisma.$transaction(async (tx) => {
      const flow = await tx.flow.findUnique({ where: { botId } });

      if (!flow) {
        throw new Error('Workflow not found. Save your workflow before publishing.');
      }

      // Only update the stored token when a new one was submitted.
      const tokenUpdate = token ? { token: encryptToken(token) } : {};

      await tx.bot.update({
        where: { id: botId, userId: user.id },
        data: tokenUpdate,
      });

      await tx.flowSnapshot.upsert({
        where: { flowId: flow.id },
        create: { flowId: flow.id, nodes: flow.nodes, edges: flow.edges },
        // Explicit updatedAt so republish always advances the timestamp used by getBotStatus.
        update: { nodes: flow.nodes, edges: flow.edges, updatedAt: new Date() },
      });
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish bot',
    };
  }
}
