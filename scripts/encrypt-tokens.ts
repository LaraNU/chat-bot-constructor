/**
 * One-time migration script: encrypts all plaintext Bot.token values in the database.
 *
 * Idempotent: rows whose token already starts with "enc:v1:" are skipped.
 *
 * Usage:
 *   npx tsx scripts/encrypt-tokens.ts
 *
 * Requirements:
 *   BOT_TOKEN_ENCRYPTION_KEY must be set in the environment (64-char hex string).
 *   DATABASE_URL / DIRECT_URL must be set (same as for the application).
 */

import { PrismaClient } from '@prisma/client';
import { encryptToken } from '../src/shared/lib/crypto';

const ENCRYPTED_PREFIX = 'enc:v1:';

async function main() {
  const prisma = new PrismaClient();

  try {
    const bots = await prisma.bot.findMany({
      where: { token: { not: null } },
      select: { id: true, token: true },
    });

    const plaintext = bots.filter((b) => !b.token!.startsWith(ENCRYPTED_PREFIX));

    console.log(`Found ${bots.length} bots with tokens; ${plaintext.length} need encryption.`);

    if (plaintext.length === 0) {
      console.log('Nothing to do.');
      return;
    }

    let updated = 0;
    let failed = 0;

    for (const bot of plaintext) {
      try {
        const encrypted = encryptToken(bot.token!);
        await prisma.bot.update({
          where: { id: bot.id },
          data: { token: encrypted },
        });
        updated++;
      } catch (err) {
        console.error(`Failed to encrypt token for bot ${bot.id}:`, err);
        failed++;
      }
    }

    console.log(`Done. Updated: ${updated}, failed: ${failed}.`);

    if (failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
