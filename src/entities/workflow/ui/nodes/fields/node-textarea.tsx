'use client';

import { memo } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { useNodeInput } from '@/shared/lib/hooks';
import { useWorkflowActions } from '@/features/workflow-actions';

interface NodeTextareaProps {
  nodeId: string;
  field: string;
  initialValue: string;
  placeholder?: string;
  className?: string;
}

export const NodeTextarea = memo(
  ({ nodeId, field, initialValue, placeholder, className }: NodeTextareaProps) => {
    const { onNodeUpdate } = useWorkflowActions();

    const input = useNodeInput({
      initialValue,
      nodeId,
      field,
      onUpdate: onNodeUpdate,
    });

    return (
      <Textarea
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

NodeTextarea.displayName = 'NodeTextarea';
