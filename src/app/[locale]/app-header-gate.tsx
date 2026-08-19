'use client';

import { usePathname } from '@/i18n/navigation';
import { useAuth } from '@/app/providers/auth-provider';
import { Header } from '@/widgets/header';

export function AppHeaderGate() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user && pathname === '/') {
    return null;
  }

  return <Header />;
}
