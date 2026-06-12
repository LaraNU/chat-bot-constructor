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
  }
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
    },
    update: {
      currentNodeId,
      tempData: serializedTempData,
    },
  });
}
