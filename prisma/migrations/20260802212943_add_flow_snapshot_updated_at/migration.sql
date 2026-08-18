-- AlterTable
ALTER TABLE "FlowSnapshot" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing rows so updatedAt matches the original publish time
UPDATE "FlowSnapshot" SET "updatedAt" = "createdAt";
