export type BotStatusFilter = 'all' | 'published' | 'draft';

export interface BotListFilters {
  status: BotStatusFilter;
  search: string;
}
