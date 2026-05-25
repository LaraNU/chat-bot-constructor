'use client';

import { useState, KeyboardEvent } from 'react';

interface UseNodeInputProps {
  initialValue: string;
  nodeId: string;
  field: string;
  onUpdate: (id: string, data: Record<string, string>) => void;
}

export function useNodeInput({ initialValue, nodeId, field, onUpdate }: UseNodeInputProps) {
  const [value, setValue] = useState(initialValue);

  const commitChange = () => {
    if (value !== initialValue) {
      onUpdate(nodeId, { [field]: value });
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
