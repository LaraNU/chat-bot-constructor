import type { SerializedBot } from '../api/actions';
import type { BotFilters } from '@/features/bot-filters';

export function filterBots(bots: SerializedBot[], filters: BotFilters) {
  return bots.filter((bot) => {
    const matchesStatus =
      filters.status === 'all' ||
      // 'published_with_changes' is semantically published — include it in the published filter
      (filters.status === 'published' && bot.status !== 'draft') ||
      (filters.status === 'draft' && bot.status === 'draft');

    const matchesSearch = bot.name.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesSearch;
  });
}
