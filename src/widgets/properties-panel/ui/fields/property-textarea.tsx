'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/utils';
import { ControlledTextarea } from '@/shared/ui/controlled-textarea';

const PROPERTY_TEXTAREA_CLASSNAME = '[field-sizing:content] min-h-[80px] resize-none';

type PropertyTextareaProps = ComponentProps<typeof ControlledTextarea>;

export function PropertyTextarea({ className, ...props }: PropertyTextareaProps) {
  return <ControlledTextarea className={cn(PROPERTY_TEXTAREA_CLASSNAME, className)} {...props} />;
}
