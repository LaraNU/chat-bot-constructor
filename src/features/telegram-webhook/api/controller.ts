import { NextRequest, NextResponse } from 'next/server';

import type { AppNode, AppEdge } from '@/entities/workflow';
import { flowSnapshotRepository } from '@/entities/workflow/server/snapshot-repository';

import type { TelegramUpdate, UserContext } from '../model/types';

import { getUserSessionState, saveUserSession } from '../lib/session';
import { runWorkflowEngine } from '../lib/engine';

export async function handleTelegramWebhook(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const botId = searchParams.get('botId');
    const botToken = searchParams.get('token');

    if (!botId || !botToken) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 400 });
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

    const context: UserContext = {
      botId,
      botToken,

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

    await saveUserSession(context.botId, context.chatId, finalNodeId, tempData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook Execution Error:', error);

    return NextResponse.json({ success: true });
  }
}
