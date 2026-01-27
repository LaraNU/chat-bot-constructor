import type { Bot } from '@prisma/client';

export type GetBotsResponse = Bot[];

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  details?: string;
};
