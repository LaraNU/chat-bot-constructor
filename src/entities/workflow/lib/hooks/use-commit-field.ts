'use client';

import { useCallback, useState } from 'react';

interface UseCommitFieldProps {
  value: string;
  onCommit: (value: string) => void;
  trim?: boolean;
  allowEmpty?: boolean;
}

export function useCommitField({
  value: initialValue,
  onCommit,
  trim = true,
  allowEmpty = false,
}: UseCommitFieldProps) {
  const [value, setValue] = useState(initialValue);

  const commit = useCallback(() => {
    const nextValue = trim ? value.trim() : value;

    if (!allowEmpty && nextValue === '') {
      setValue(initialValue);
      return;
    }

    if (nextValue !== initialValue) {
      onCommit(nextValue);
    }
  }, [allowEmpty, initialValue, onCommit, trim, value]);

  return {
    value,
    setValue,
    commit,
  };
}
