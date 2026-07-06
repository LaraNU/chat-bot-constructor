'use client';

import { Label } from '@/shared/ui/label';

interface PropertyFieldProps {
  label: string;
  children: React.ReactNode;
}

export function PropertyField({ label, children }: PropertyFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground/70 text-[10px] font-bold uppercase">{label}</Label>
      {children}
    </div>
  );
}
