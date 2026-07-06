'use client';

import { cn } from '@/shared/lib/utils';
import { ControlledInput, type ControlledInputProps } from '@/shared/ui/controlled-input';

type PropertyInputProps = ControlledInputProps;

export function PropertyInput({ className, ...props }: PropertyInputProps) {
  return <ControlledInput className={cn(className)} {...props} />;
}
