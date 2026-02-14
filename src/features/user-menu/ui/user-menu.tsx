'use client';

import { createClient } from '@/shared/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { User } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';

export function UserMenu({ user }: { user: User }) {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations('Header');

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.refresh();
  };

  return (
    <>
      <span className="text-muted-foreground text-sm">
        {user.user_metadata?.display_name || user.email}
      </span>
      <Button size="sm" onClick={handleLogout} data-testid="sign-out-button">
        {t('signOut')}
      </Button>
    </>
  );
}
