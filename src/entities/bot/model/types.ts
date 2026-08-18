import { z } from 'zod';

export const createBotSchema = z.object({
  name: z
    .string()
    .min(3, 'Bot name must be at least 3 characters')
    .max(32, 'Bot name must be at most 32 characters'),
  description: z.string().max(100, 'Description must be at most 100 characters').optional(),
});

export type CreateBot = z.infer<typeof createBotSchema>;

export type Bot = {
  name: string;
  description: string | null;
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Computed publishing status for a bot.
 *
 * - `draft`                 — bot has never been published (no token).
 * - `published`             — bot is live and the snapshot matches the current flow.
 * - `published_with_changes`— bot is live but the flow was saved after the last publish.
 */
export type BotStatus = 'draft' | 'published' | 'published_with_changes';

type BotStatusInput = {
  token: string | null;
  flowUpdatedAt: Date | null;
  snapshotUpdatedAt: Date | null;
};

/**
 * Pure function — no DB calls, safe to use in serialization and tests.
 * `flowUpdatedAt` and `snapshotUpdatedAt` may be null when the related row
 * is absent (e.g. a bot whose flow was deleted — edge case, treated as draft).
 *
 * Compare against snapshot.updatedAt (not createdAt): republish must advance
 * the snapshot timestamp so a freshly published bot returns to `published`.
 */
export function getBotStatus({
  token,
  flowUpdatedAt,
  snapshotUpdatedAt,
}: BotStatusInput): BotStatus {
  if (!token) return 'draft';
  if (!snapshotUpdatedAt || !flowUpdatedAt) return 'published';

  return flowUpdatedAt > snapshotUpdatedAt ? 'published_with_changes' : 'published';
}
