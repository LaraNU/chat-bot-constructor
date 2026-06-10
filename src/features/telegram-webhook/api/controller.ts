import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import type { AppNode, AppEdge } from '@/entities/workflow';
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
    if (!update.message?.text && !callbackQuery) {
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
      userText: callbackQuery ? callbackQuery.data : update.message!.text!,
      username: callbackQuery
        ? (callbackQuery.from?.username ?? '')
        : (update.message!.from?.username ?? ''),
    };

    const flow = await prisma.flow.findUnique({ where: { botId } });
    if (!flow) {
      return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
    }

    const { currentNodeId: initialNodeId, tempData } = await getUserSessionState(
      context.botId,
      context.chatId,
      context.userText
    );

    const finalNodeId = await runWorkflowEngine({
      nodes: flow.nodes as AppNode[],
      edges: flow.edges as AppEdge[],
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
