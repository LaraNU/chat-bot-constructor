import { apiFetch } from '@/shared/api/base';
import type { Bot } from '@prisma/client';
import { CreateBot } from '../model/types';

export const getBots = async (): Promise<Bot[]> => {
  return await apiFetch('/bots');
};

export const createNewBot = async (dto: CreateBot): Promise<Bot> => {
  return await apiFetch('/bots', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
};
