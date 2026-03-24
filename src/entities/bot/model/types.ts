import { z } from 'zod';

export const createBotSchema = z.object({
  name: z
    .string()
    .min(3, 'Bot name must be at least 3 characters')
    .max(32, 'Bot name must be at most 32 characters'),
  description: z.string().max(100, 'Description must be at most 100 characters').optional(),
});

export type CreateBot = z.infer<typeof createBotSchema>;
