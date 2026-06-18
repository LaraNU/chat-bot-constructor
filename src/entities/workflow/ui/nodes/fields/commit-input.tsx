'use client';

import { memo, KeyboardEvent, useCallback } from 'react';

import { Input } from '@/shared/ui/input';

import { useCommitField } from '@/entities/workflow/lib';

interface CommitInputProps {
  value: string;
  onCommit: (value: string) => void;

  placeholder?: string;
  className?: string;

  trim?: boolean;
  allowEmpty?: boolean;
}

function CommitInputComponent({
  value,
  onCommit,
  placeholder,
  className,
  trim,
  allowEmpty,
}: CommitInputProps) {
  const field = useCommitField({
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
      className={`nodrag nowheel ${className ?? ''}`}
      value={field.value}
      placeholder={placeholder}
      onChange={(event) => field.setValue(event.target.value)}
      onBlur={field.commit}
      onKeyDown={handleKeyDown}
    />
  );
}

export const CommitInput = memo(CommitInputComponent);
