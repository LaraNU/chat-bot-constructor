-- AlterTable: add updatedAt to Flow
-- DEFAULT NOW() backfills existing rows; @updatedAt in Prisma keeps it current on every update.
ALTER TABLE "Flow" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- CreateTable
CREATE TABLE "FlowSnapshot" (
    "id" TEXT NOT NULL,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flowId" TEXT NOT NULL,

    CONSTRAINT "FlowSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlowSnapshot_flowId_key" ON "FlowSnapshot"("flowId");

-- AddForeignKey
ALTER TABLE "FlowSnapshot" ADD CONSTRAINT "FlowSnapshot_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: seed FlowSnapshot for all currently published bots.
-- Invariant: Bot.token IS NOT NULL → FlowSnapshot must exist.
-- This eliminates the need for a runtime fallback in the webhook.
INSERT INTO "FlowSnapshot" ("id", "flowId", "nodes", "edges", "createdAt")
SELECT
    gen_random_uuid(),
    f."id",
    f."nodes",
    f."edges",
    NOW()
FROM "Flow" f
JOIN "Bot" b ON b."id" = f."botId"
WHERE b."token" IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM "FlowSnapshot" s WHERE s."flowId" = f."id"
  );
