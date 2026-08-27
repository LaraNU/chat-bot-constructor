import { NextRequest, NextResponse } from 'next/server';

import type { AppNode, AppEdge } from '@/entities/workflow';
import { flowSnapshotRepository } from '@/entities/workflow/server/snapshot-repository';
import { botService } from '@/entities/bot/server';
import { consumeWebhookBotRateLimit, consumeWebhookIpRateLimit } from '@/shared/lib/rate-limit';

import type { TelegramUpdate, UserContext } from '../model/types';

import { getUserSessionState, saveUserSession, isUpdateAlreadyProcessed } from '../lib/session';
import { runWorkflowEngine } from '../lib/engine';
import { getClientIp } from '../lib/client-ip';

const TELEGRAM_SECRET_TOKEN_HEADER = 'x-telegram-bot-api-secret-token';

export async function handleTelegramWebhook(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('botId');

  if (!botId) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 400 });
  }

  // Validated before any DB access: the secret is derived purely from `botId` +
  // a server-only key, so a forged/unknown botId is rejected for free.
  const providedSecret = request.headers.get(TELEGRAM_SECRET_TOKEN_HEADER);

  if (!botService.verifyWebhookSecret(botId, providedSecret)) {
    consumeWebhookIpRateLimit(getClientIp(request));
    return NextResponse.json({ error: 'Invalid secret token' }, { status: 401 });
  }

  // Valid Telegram traffic is dropped with 200 (not 429) so Telegram does not
  // retry-storm a bot that is over its best-effort in-memory cap.
  if (!consumeWebhookBotRateLimit(botId).allowed) {
    return NextResponse.json({ success: true });
  }

  try {
    // The bot token is read from the database, never trusted from the request —
    // the URL only ever carries `botId`, keeping the live token out of logs/proxies.
    const bot = await botService.getBotById(botId);

    if (!bot?.token) {
      console.error(`[webhook] Invariant violation: bot "${botId}" has no token configured.`);

      return NextResponse.json({ error: 'Bot is not published' }, { status: 500 });
    }

    const update = (await request.json()) as TelegramUpdate;

    const callbackQuery = update.callback_query;

    const hasMessage = Boolean(update.message?.text);
    const hasCallback = Boolean(callbackQuery);

    if (!hasMessage && !hasCallback) {
      return NextResponse.json({ success: true });
    }

    const chatId = callbackQuery ? callbackQuery.message?.chat.id : update.message?.chat.id;

    if (!chatId) {
      return NextResponse.json({ success: true });
    }

    // Idempotency guard (#61): must run before `getUserSessionState`, whose `/start`
    // branch resets the dialog without touching the DB — a retried `/start` would
    // otherwise re-send the welcome step every time. Runs after the message/callback
    // filter above since irrelevant update types have no side effects to deduplicate.
    if (await isUpdateAlreadyProcessed(botId, chatId.toString(), update.update_id)) {
      return NextResponse.json({ success: true });
    }

    const context: UserContext = {
      botId,
      botToken: bot.token,

      chatId: chatId.toString(),
      userText: update.message?.text ?? '',
      callbackData: callbackQuery?.data,

      username: callbackQuery
        ? (callbackQuery.from?.username ?? '')
        : (update.message?.from?.username ?? ''),
    };

    // Webhook reads exclusively from the published snapshot — never from the draft.
    // If no snapshot exists the invariant (token → snapshot) is violated: this is a
    // data integrity error, not a graceful degradation scenario.
    const snapshot = await flowSnapshotRepository.findByBotId(botId);

    if (!snapshot) {
      console.error(
        `[webhook] Invariant violation: bot "${botId}" has no published FlowSnapshot. ` +
          `Data migration may be incomplete or the bot was never published via the new flow.`
      );

      return NextResponse.json(
        { error: 'Published workflow snapshot not found.' },
        { status: 500 }
      );
    }

    const { currentNodeId: initialNodeId, tempData } = await getUserSessionState(
      context.botId,
      context.chatId,
      context.userText || ''
    );

    const finalNodeId = await runWorkflowEngine({
      nodes: snapshot.nodes as AppNode[],
      edges: snapshot.edges as AppEdge[],
      initialNodeId,
      context,
      tempData,
    });

    await saveUserSession(context.botId, context.chatId, finalNodeId, tempData, update.update_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook Execution Error:', error);

    return NextResponse.json({ success: true });
  }
}
