'use client';

import { memo } from 'react';

import { Textarea } from '@/shared/ui/textarea';

import { useControlledTextarea } from './use-controlled-textarea';

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
  const field = useControlledTextarea({
    value,
    onCommit,
    trim,
    allowEmpty,
  });

  return (
    <Textarea
      className={`nodrag nowheel ${className ?? ''}`}
      value={field.value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => field.onChange(e.target.value)}
      onBlur={field.onBlur}
    />
  );
}

export const ControlledTextarea = memo(ControlledTextareaComponent);
