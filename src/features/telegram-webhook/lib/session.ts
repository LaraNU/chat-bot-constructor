import { prisma } from '@/shared/lib/prisma';

export async function getCurrentNodeId(
  botId: string,
  chatId: string,
  userText: string
): Promise<string | null> {
  if (userText.toLowerCase() === '/start') {
    return null;
  }

  const session = await prisma.userSession.findUnique({
    where: { botId_telegramChatId: { botId, telegramChatId: chatId } },
  });

  return session?.currentNodeId ?? null;
}

export async function saveUserSession(
  botId: string,
  chatId: string,
  currentNodeId: string | null
): Promise<void> {
  await prisma.userSession.upsert({
    where: { botId_telegramChatId: { botId, telegramChatId: chatId } },
    create: { botId, telegramChatId: chatId, currentNodeId },
    update: { currentNodeId },
  });
}
