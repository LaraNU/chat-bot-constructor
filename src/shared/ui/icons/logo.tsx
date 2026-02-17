import { cn } from '@/shared/lib/utils';
import { ComponentPropsWithoutRef } from 'react';

interface LogoProps extends ComponentPropsWithoutRef<'div'> {
  iconClassName?: string;
}

export const Logo = ({ className, iconClassName, ...props }: LogoProps) => {
  return (
    <div
      className={cn('bg-muted flex h-10 w-10 items-center justify-center rounded-lg', className)}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn('text-foreground h-5 w-5', iconClassName)}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </svg>
    </div>
  );
};
