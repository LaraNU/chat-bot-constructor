'use client';

import { ThemeProvider } from '@/shared/lib/theme';
import { AuthProvider } from './auth-provider';
import { Toaster } from '@/shared/ui/sonner';
import { ReactNode } from 'react';
import { User } from '@supabase/supabase-js';

type AppProvidersProps = {
  children: ReactNode;
  initialUser: User | null;
};

export function AppProviders({ children, initialUser }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider initialUser={initialUser}>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
