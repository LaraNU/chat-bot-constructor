'use client';

import { JSX, memo } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { useNodeInput } from '@/shared/lib/hooks';

type NodeInputField<T> = Extract<keyof T, string>;
type NodeInputValue<T, K extends NodeInputField<T>> = T[K] extends string | undefined
  ? string
  : never;

interface NodeTextareaProps<T extends object, K extends NodeInputField<T>> {
  nodeId: string;
  field: K;
  initialValue: NodeInputValue<T, K>;
  placeholder?: string;
  className?: string;
  onUpdate: (nodeId: string, data: Partial<Record<K, string>>) => void;
}

function NodeTextareaComponent<T extends object, K extends NodeInputField<T>>({
  nodeId,
  field,
  initialValue,
  placeholder,
  className,
  onUpdate,
}: NodeTextareaProps<T, K>) {
  const input = useNodeInput<T, K>({
    initialValue,
    nodeId,
    field,
    onUpdate,
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

type NodeTextareaComponentType = <T extends object, K extends NodeInputField<T>>(
  props: NodeTextareaProps<T, K>
) => JSX.Element;

export const NodeTextarea = memo(NodeTextareaComponent) as unknown as NodeTextareaComponentType;
