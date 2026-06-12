'use client';

import { memo } from 'react';

import { Textarea } from '@/shared/ui/textarea';

import { useCommitField } from '@/entities/workflow/lib';

interface CommitTextareaProps {
  value: string;
  onCommit: (value: string) => void;

  placeholder?: string;
  className?: string;

  trim?: boolean;
  allowEmpty?: boolean;
}

function CommitTextareaComponent({
  value,
  onCommit,
  placeholder,
  className,
  trim,
  allowEmpty,
}: CommitTextareaProps) {
  const field = useCommitField({
    value,
    onCommit,
    trim,
    allowEmpty,
  });

  return (
    <Textarea
      className={`nodrag nowheel ${className ?? ''}`}
      value={field.value}
      placeholder={placeholder}
      onChange={(event) => field.setValue(event.target.value)}
      onBlur={field.commit}
    />
  );
}

export const CommitTextarea = memo(CommitTextareaComponent);
