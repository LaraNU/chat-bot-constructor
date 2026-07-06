'use client';

import { memo } from 'react';

import { cn } from '@/shared/lib/utils';
import { useControlledField } from '@/shared/ui/controlled-field';
import { Textarea } from '@/shared/ui/textarea';

interface ControlledTextareaProps {
  value: string;
  onCommit: (value: string) => void;

  placeholder?: string;
  className?: string;

  trim?: boolean;
  allowEmpty?: boolean;

  rows?: number;
}

function ControlledTextareaComponent({
  value,
  onCommit,
  placeholder,
  className,
  trim,
  allowEmpty,
  rows,
}: ControlledTextareaProps) {
  const field = useControlledField({
    value,
    onCommit,
    trim,
    allowEmpty,
  });

  return (
    <Textarea
      className={cn('nodrag nowheel', className)}
      value={field.value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => field.onChange(e.target.value)}
      onBlur={field.onBlur}
    />
  );
}

export const ControlledTextarea = memo(ControlledTextareaComponent);
