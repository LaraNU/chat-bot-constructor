'use client';

import { memo } from 'react';
import { Input } from '@/shared/ui/input';
import { useNodeInput } from '@/shared/lib/hooks';
import { useWorkflowActions } from '@/features/workflow-actions';

interface NodeInputProps {
  nodeId: string;
  field: string;
  initialValue: string;
  placeholder?: string;
  className?: string;
}

export const NodeInput = memo(
  ({ nodeId, field, initialValue, placeholder, className }: NodeInputProps) => {
    const { onNodeUpdate } = useWorkflowActions();

    const input = useNodeInput({
      initialValue,
      nodeId,
      field,
      onUpdate: onNodeUpdate,
    });

    return (
      <Input
        key={`${nodeId}-${field}-${initialValue}`}
        className={`nodrag nowheel ${className ?? ''}`}
        placeholder={placeholder}
        value={input.value}
        onChange={(e) => input.setValue(e.target.value)}
        onBlur={input.handleBlur}
        onKeyDown={input.handleKeyDown}
      />
    );
  }
);

NodeInput.displayName = 'NodeInput';
