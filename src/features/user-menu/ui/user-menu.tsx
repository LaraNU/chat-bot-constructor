'use client';

import { useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { createClient } from '@/shared/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { User } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

export function UserMenu({ user }: { user: User }) {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations('Header');
  const [isLoading, setIsLoading] = useState(false);

  const displayName = user.user_metadata?.display_name || user.email || '';

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
      <div className="hidden items-center gap-4 min-[732px]:flex">
        <span className="text-muted-foreground max-w-[160px] truncate text-sm" title={displayName}>
          {displayName}
        </span>
        <Button size="sm" onClick={handleLogout} disabled={isLoading} data-testid="sign-out-button">
          {isLoading && <Spinner data-icon="inline-start" />}
          {t('signOut')}
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 min-[732px]:hidden"
            disabled={isLoading}
            aria-label={t('accountMenu')}
            data-testid="user-menu-trigger"
          >
            {isLoading ? <Spinner /> : <UserIcon className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel
            className="text-muted-foreground max-w-[200px] truncate font-normal"
            title={displayName}
            data-testid="user-menu-dropdown-label"
          >
            {displayName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={handleLogout}
            disabled={isLoading}
            data-testid="sign-out-menu-item"
          >
            <LogOut className="h-4 w-4" />
            {t('signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
