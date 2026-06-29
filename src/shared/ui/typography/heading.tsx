import { cn } from '@/shared/lib/utils';
import { JSX } from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5;

interface HeadingProps {
  children: React.ReactNode;
  level?: HeadingLevel;
  className?: string;
}

const styles = {
  1: 'text-3xl font-bold',
  2: 'text-2xl font-semibold',
  3: 'text-xl font-semibold',
  4: 'text-lg font-medium',
  5: 'text-lg font-medium',
};

export function Heading({ children, level = 2, className }: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return <Tag className={cn(styles[level], className)}>{children}</Tag>;
}
