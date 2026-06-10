import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { TempData } from './nodes/types';

interface UserSessionState {
  currentNodeId: string | null;
  tempData: TempData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeTempData(value: unknown): TempData {
  if (!isRecord(value)) {
    return { answers: {} };
  }

  const answers = isRecord(value.answers)
    ? Object.fromEntries(
        Object.entries(value.answers).map(([key, answer]) => [key, String(answer)])
      )
    : {};

  return {
    ...value,
    answers,
  };
}

export async function getUserSessionState(
  botId: string,
  chatId: string,
  userText: string
): Promise<UserSessionState> {
  if (userText.toLowerCase() === '/start') {
    return {
      currentNodeId: null,
      tempData: { answers: {} },
    };
  }

  const session = await prisma.userSession.findUnique({
    where: { botId_telegramChatId: { botId, telegramChatId: chatId } },
    select: { currentNodeId: true, tempData: true },
  });

  return {
    currentNodeId: session?.currentNodeId ?? null,
    tempData: normalizeTempData(session?.tempData),
  };
}

export async function getCurrentNodeId(
  botId: string,
  chatId: string,
  userText: string
): Promise<string | null> {
  const sessionState = await getUserSessionState(botId, chatId, userText);
  return sessionState.currentNodeId;
}

export async function saveUserSession(
  botId: string,
  chatId: string,
  currentNodeId: string | null,
  tempData: TempData = { answers: {} }
): Promise<void> {
  const serializedTempData = JSON.parse(JSON.stringify(tempData)) as Prisma.InputJsonValue;

  await prisma.userSession.upsert({
    where: { botId_telegramChatId: { botId, telegramChatId: chatId } },
    create: { botId, telegramChatId: chatId, currentNodeId, tempData: serializedTempData },
    update: { currentNodeId, tempData: serializedTempData },
  });
}
