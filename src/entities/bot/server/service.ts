import { botRepository } from './repository';
import { createClient } from '@/shared/lib/supabase/server';

export const botService = {
  async getAllBots() {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    return await botRepository.findAllByUserId(user.id);
  },

  async createNewBot(data: { name: string; description?: string }) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be authorized');
    }

    if (data.name.length < 3) {
      throw new Error('Bot name is too short (minimum 3 characters)');
    }

    return await botRepository.create({
      ...data,
      userId: user.id,
    });
  },
};
