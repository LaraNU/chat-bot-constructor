'use client';

import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';
import { Label } from '@/shared/ui/label';

type EditorFieldProps = {
  label: string;
  htmlFor?: string;
  children?: ReactNode;
  className?: string;
};

export function EditorField({ label, htmlFor, children, className }: EditorFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-muted-foreground/70 text-[10px] font-bold uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}
