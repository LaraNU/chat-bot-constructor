'use client';

import { useCallback, useState } from 'react';

interface UseControlledTextareaProps {
  value: string;
  onCommit: (value: string) => void;
  trim?: boolean;
  allowEmpty?: boolean;
}

export function useControlledTextarea({
  value,
  onCommit,
  trim = true,
  allowEmpty = false,
}: UseControlledTextareaProps) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  const displayedValue = editing ? draft : value;

  const handleChange = useCallback((next: string) => {
    setEditing(true);
    setDraft(next);
  }, []);

  const handleBlur = useCallback(() => {
    setEditing(false);

    const next = trim ? draft.trim() : draft;

    if (!allowEmpty && next === '') {
      setDraft(value);
      return;
    }

    if (next !== value) {
      onCommit(next);
    }
  }, [allowEmpty, draft, onCommit, trim, value]);

  return {
    value: displayedValue,
    onChange: handleChange,
    onBlur: handleBlur,
  };
}
