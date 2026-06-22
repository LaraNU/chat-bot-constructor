'use client';

import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { BotStatusFilter } from '../model/types';

export type BotFilters = {
  status: BotStatusFilter;
  search: string;
};

interface BotFiltersProps {
  filters: BotFilters;
  onFiltersChange: (filters: BotFilters) => void;
}

export function BotFilters({ filters, onFiltersChange }: BotFiltersProps) {
  const t = useTranslations('BotFilters');

  return (
    <div className="mb-8 flex flex-col items-end gap-3">
      <div className="relative mx-[auto] my-[0] w-full max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder={t('placeholder')}
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              search: e.target.value,
            })
          }
          className="bg-muted/50 focus-visible:bg-background h-9 w-full pl-9 text-sm"
        />
      </div>

      <div>
        <Select
          value={filters.status}
          onValueChange={(value: BotStatusFilter) =>
            onFiltersChange({
              ...filters,
              status: value,
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">{t('selectContent.all')}</SelectItem>
            <SelectItem value="published">{t('selectContent.published')}</SelectItem>
            <SelectItem value="draft">{t('selectContent.draft')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
