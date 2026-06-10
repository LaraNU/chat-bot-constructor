'use client';

import { useState, KeyboardEvent } from 'react';

type NodeInputField<T> = Extract<keyof T, string>;
type NodeInputValue<T, K extends NodeInputField<T>> = T[K] extends string | undefined
  ? string
  : never;

interface UseNodeInputProps<T extends object, K extends NodeInputField<T>> {
  initialValue: NodeInputValue<T, K>;
  nodeId: string;
  field: K;
  onUpdate: (id: string, data: Partial<Record<K, string>>) => void;
}

export function useNodeInput<T extends object, K extends NodeInputField<T>>({
  initialValue,
  nodeId,
  field,
  onUpdate,
}: UseNodeInputProps<T, K>) {
  const [value, setValue] = useState<string>(initialValue);

  const commitChange = () => {
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      setValue(initialValue);
      return;
    }

    if (trimmedValue !== initialValue) {
      const updatePayload: Partial<Record<K, string>> = {};
      updatePayload[field] = trimmedValue;

      onUpdate(nodeId, updatePayload);
    }
  };

  const handleBlur = () => {
    commitChange();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.tagName === 'INPUT') {
      e.currentTarget.blur();
    }
  };

  return {
    value,
    setValue,
    handleBlur,
    handleKeyDown,
  };
}
