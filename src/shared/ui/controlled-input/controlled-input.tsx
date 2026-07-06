'use client';

import { memo, useCallback, type KeyboardEvent } from 'react';

import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/ui/input';

import { useControlledField } from '@/shared/ui/controlled-field';

export interface ControlledInputProps {
  value: string;
  onCommit: (value: string) => void;

  placeholder?: string;
  className?: string;

  trim?: boolean;
  allowEmpty?: boolean;
}

function ControlledInputComponent({
  value,
  onCommit,
  placeholder,
  className,
  trim,
  allowEmpty,
}: ControlledInputProps) {
  const field = useControlledField({
    value,
    onCommit,
    trim,
    allowEmpty,
  });

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  }, []);

  return (
    <Input
      className={cn('nodrag nowheel', className)}
      value={field.value}
      placeholder={placeholder}
      onChange={(e) => field.onChange(e.target.value)}
      onBlur={field.onBlur}
      onKeyDown={handleKeyDown}
    />
  );
}

export const ControlledInput = memo(ControlledInputComponent);
