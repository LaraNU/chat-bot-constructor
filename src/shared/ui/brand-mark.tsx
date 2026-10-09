import { cn } from '@/shared/lib/utils';

type BrandMarkProps = {
  name: string;
  className?: string;
  iconBoxClassName?: string;
  iconClassName?: string;
  nameClassName?: string;
};

/**
 * The site's icon + name mark, used wherever the brand appears (main header,
 * landing header, footer). Previously each place inlined its own copy of
 * this SVG, and only one of them hid the name below the `md` breakpoint —
 * consolidated here so the responsive behavior can't drift between copies
 * again. Callers are responsible for wrapping this in a `Link` when the
 * mark should be clickable; it stays presentation-only.
 */
export function BrandMark({
  name,
  className,
  iconBoxClassName,
  iconClassName,
  nameClassName,
}: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'bg-foreground flex h-8 w-8 items-center justify-center rounded-lg',
          iconBoxClassName
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn('text-background h-5 w-5', iconClassName)}
          stroke="currentColor"
          strokeWidth="2"
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
      <span
        className={cn('hidden text-lg font-semibold tracking-tight md:inline-block', nameClassName)}
      >
        {name}
      </span>
    </div>
  );
}
