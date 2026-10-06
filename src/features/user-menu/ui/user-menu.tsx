'use client';

import { useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { User } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';

export function UserMenu({ user }: { user: User }) {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations('Header');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(t('signOutError'), { position: 'top-center' });
      setIsLoading(false);
      return;
    }

    router.refresh();
    // isLoading intentionally stays true — the header swaps away from
    // UserMenu once the refreshed auth state propagates.
  };

  return (
    <>
      <span className="text-muted-foreground text-sm">
        {user.user_metadata?.display_name || user.email}
      </span>
      <Button size="sm" onClick={handleLogout} disabled={isLoading} data-testid="sign-out-button">
        {isLoading && <Spinner data-icon="inline-start" />}
        {t('signOut')}
      </Button>
    </>
  );
}
