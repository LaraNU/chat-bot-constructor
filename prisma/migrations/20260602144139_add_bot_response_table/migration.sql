-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tempData" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "BotResponse" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "telegramChatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answers" JSONB NOT NULL,

    CONSTRAINT "BotResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotResponse_botId_telegramChatId_idx" ON "BotResponse"("botId", "telegramChatId");
