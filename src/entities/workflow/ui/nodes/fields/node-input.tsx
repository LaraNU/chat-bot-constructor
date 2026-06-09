'use client';

import { JSX, memo } from 'react';
import { Input } from '@/shared/ui/input';
import { useNodeInput } from '@/shared/lib/hooks';

type NodeInputField<T> = Extract<keyof T, string>;
type NodeInputValue<T, K extends NodeInputField<T>> = T[K] extends string | undefined
  ? string
  : never;

interface NodeInputProps<T extends object, K extends NodeInputField<T>> {
  nodeId: string;
  field: K;
  initialValue: NodeInputValue<T, K>;
  placeholder?: string;
  className?: string;
  onUpdate: (nodeId: string, data: Partial<Record<K, string>>) => void;
}

function NodeInputComponent<T extends object, K extends NodeInputField<T>>({
  nodeId,
  field,
  initialValue,
  placeholder,
  className,
  onUpdate,
}: NodeInputProps<T, K>) {
  const input = useNodeInput<T, K>({
    initialValue,
    nodeId,
    field,
    onUpdate,
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

type NodeInputComponentType = <T extends object, K extends NodeInputField<T>>(
  props: NodeInputProps<T, K>
) => JSX.Element;

export const NodeInput = memo(NodeInputComponent) as unknown as NodeInputComponentType;
