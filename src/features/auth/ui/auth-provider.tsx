'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/shared/lib/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<{ user: User | null }>({ user: null });

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.refresh();
      } else if (session?.user) {
        setUser(session.user);

        if (!user) router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, user]);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
