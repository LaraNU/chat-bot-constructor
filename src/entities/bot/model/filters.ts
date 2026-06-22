import type { SerializedBot } from '../api/actions';
import type { BotFilters } from '@/features/bot-filters';

export function filterBots(bots: SerializedBot[], filters: BotFilters) {
  return bots.filter((bot) => {
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'published' && bot.isPublished) ||
      (filters.status === 'draft' && !bot.isPublished);

    const matchesSearch = bot.name.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesSearch;
  });
}
