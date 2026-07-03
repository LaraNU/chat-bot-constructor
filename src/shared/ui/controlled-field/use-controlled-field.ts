'use client';

import { useCallback, useState } from 'react';

export interface UseControlledFieldProps {
  value: string;
  onCommit: (value: string) => void;
  trim?: boolean;
  allowEmpty?: boolean;
}

export function useControlledField({
  value,
  onCommit,
  trim = true,
  allowEmpty = false,
}: UseControlledFieldProps) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  const displayedValue = editing ? draft : value;

  const onChange = useCallback((next: string) => {
    setEditing(true);
    setDraft(next);
  }, []);

  const onBlur = useCallback(() => {
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
    onChange,
    onBlur,
  };
}
