import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@prisma/client';

import type { TempData, SavedAnswer } from './nodes/types';

interface UserSessionState {
  currentNodeId: string | null;
  tempData: TempData;
  userText: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeTempData(value: unknown): TempData {
  if (!isRecord(value)) {
    return {
      answers: {},
      responses: [],
    };
  }

  const answers: Record<string, SavedAnswer> = {};

  if (isRecord(value.answers)) {
    for (const [nodeId, answer] of Object.entries(value.answers)) {
      if (!isRecord(answer)) {
        continue;
      }

      answers[nodeId] = {
        nodeId,
        text: typeof answer.text === 'string' ? answer.text : undefined,
        buttonId: typeof answer.buttonId === 'string' ? answer.buttonId : undefined,
        buttonText: typeof answer.buttonText === 'string' ? answer.buttonText : undefined,
      };
    }
  }

  const responses = Array.isArray(value.responses)
    ? value.responses.filter(isRecord).map((item) => ({
        question: typeof item.question === 'string' ? item.question : '',
        answer: typeof item.answer === 'string' ? item.answer : '',
      }))
    : [];

  return {
    answers,
    responses,

    uploadedFileId: typeof value.uploadedFileId === 'string' ? value.uploadedFileId : undefined,

    uploadedFileType:
      typeof value.uploadedFileType === 'string' ? value.uploadedFileType : undefined,
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
      tempData: {
        answers: {},
        responses: [],
      },
      userText,
    };
  }

  const session = await prisma.userSession.findUnique({
    where: {
      botId_telegramChatId: {
        botId,
        telegramChatId: chatId,
      },
    },
    select: {
      currentNodeId: true,
      tempData: true,
    },
  });

  return {
    currentNodeId: session?.currentNodeId ?? null,
    tempData: normalizeTempData(session?.tempData),
    userText,
  };
}

/**
 * Idempotency guard for Telegram webhook retries (see #61). Telegram redelivers an
 * update if the webhook didn't answer `200 OK` in time; without this check the same
 * update would run the dialog step (and its side effects — outgoing messages,
 * `BotResponse` writes) again.
 *
 * Only the last processed `update_id` per chat is stored (`UserSession.lastUpdateId`),
 * not a history of ids: Telegram only ever retries the current unacknowledged update
 * and never redelivers an older one once a newer update_id has been accepted, so a
 * single scalar is sufficient and needs no TTL/cleanup.
 *
 * This is a best-effort, sequential-retry guard, not a full concurrency guarantee:
 * two truly concurrent deliveries of the same update_id could both pass this check
 * before either writes back via `saveUserSession`. Closing that race would require
 * holding a lock for the whole webhook handler duration (including outbound Telegram
 * API calls), which is disproportionate at this stage — Telegram does not deliver the
 * same update_id in parallel, only sequentially after a timeout/error, so this window
 * is not expected to be hit in practice.
 */
export async function isUpdateAlreadyProcessed(
  botId: string,
  chatId: string,
  updateId: number
): Promise<boolean> {
  const session = await prisma.userSession.findUnique({
    where: {
      botId_telegramChatId: {
        botId,
        telegramChatId: chatId,
      },
    },
    select: { lastUpdateId: true },
  });

  return session?.lastUpdateId === updateId;
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
  tempData: TempData = {
    answers: {},
    responses: [],
  },
  // `update_id` of the Telegram update that produced this state, if any. Written in the
  // same upsert as the rest of the session so a retry of the same update can never be
  // observed as "not yet processed" for one field but "processed" for another.
  updateId?: number
): Promise<void> {
  const serializedTempData = JSON.parse(JSON.stringify(tempData)) as Prisma.InputJsonValue;

  await prisma.userSession.upsert({
    where: {
      botId_telegramChatId: {
        botId,
        telegramChatId: chatId,
      },
    },
    create: {
      botId,
      telegramChatId: chatId,
      currentNodeId,
      tempData: serializedTempData,
      lastUpdateId: updateId ?? null,
    },
    update: {
      currentNodeId,
      tempData: serializedTempData,
      ...(updateId !== undefined ? { lastUpdateId: updateId } : {}),
    },
  });
}
