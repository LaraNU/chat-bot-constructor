'use client';

import { Heading } from '@/shared/ui/typography';

interface PropertySectionProps {
  title: string;
  children: React.ReactNode;
}

export function PropertySection({ title, children }: PropertySectionProps) {
  return (
    <div className="space-y-2 p-4">
      <Heading level={5}>{title}</Heading>
      {children}
    </div>
  );
}
