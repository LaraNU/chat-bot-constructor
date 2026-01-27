import { apiFetch } from './base';
import type { Bot } from '@prisma/client';

export const getBots = async (): Promise<Bot[]> => {
  return await apiFetch('/bots');
};
