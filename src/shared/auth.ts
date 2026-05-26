import { createClient } from '@/shared/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import { cache } from 'react';

export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Auth error:', error);
    return null;
  }

  return user;
});

export async function requireAuthenticatedUser(): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}
