import { z } from 'zod';

export const publishBotSchema = z.object({
  botId: z.string().min(1, 'Bot ID is required'),
  token: z.string().regex(/^\d+:[\w-]+$/, 'Invalid Telegram Bot Token format'),
});
