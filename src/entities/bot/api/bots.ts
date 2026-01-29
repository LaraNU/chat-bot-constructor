import { apiFetch } from '@/shared/api/base';
import type { Bot } from '@prisma/client';

export const getBots = async (): Promise<Bot[]> => {
  return await apiFetch('/bots');
};
