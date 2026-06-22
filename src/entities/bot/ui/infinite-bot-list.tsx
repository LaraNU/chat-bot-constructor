'use client';

import { useEffect, useState, useRef, memo, useCallback, useMemo } from 'react';
import { BotCard } from './bot-card';
import { DeleteBotButton } from '@/features/delete-bot';
import { fetchBotsAction, type SerializedBot } from '../api/actions';
import { Spinner } from '@/shared/ui/spinner';
import { BotFilters } from '@/features/bot-filters';
import { filterBots } from '../model';
import { useDebounce } from '@/shared/lib/hooks';

interface InfiniteBotListProps {
  initialBots: SerializedBot[];
  limit: number;
}

const MemoizedBotItem = memo(
  ({ bot, onDelete }: { bot: SerializedBot; onDelete: (id: string) => void }) => {
    return (
      <BotCard
        id={bot.id}
        name={bot.name}
        updatedAt={bot.updatedAt}
        description={bot.description}
        isPublished={bot.isPublished}
        deleteActionSlot={<DeleteBotButton botId={bot.id} onSuccess={() => onDelete(bot.id)} />}
      />
    );
  }
);

MemoizedBotItem.displayName = 'MemoizedBotItem';

export function InfiniteBotList({ initialBots, limit }: InfiniteBotListProps) {
  const [bots, setBots] = useState<SerializedBot[]>(initialBots);
  const [hasMore, setHasMore] = useState(initialBots.length === limit);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<BotFilters>({
    status: 'all',
    search: '',
  });
  const debouncedSearch = useDebounce(filters.search, 300);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleDeleteBot = useCallback((id: string) => {
    setBots((prev) => prev.filter((bot) => bot.id !== id));
  }, []);

  const loadMoreBots = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const currentOffset = bots.length;
      const newBots = await fetchBotsAction(limit, currentOffset);

      if (newBots.length < limit) {
        setHasMore(false);
      }

      setBots((prev) => [...prev, ...newBots]);
    } catch (error) {
      console.error('Failed to load more bots:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, limit, bots.length]);

  useEffect(() => {
    const trigger = loadMoreRef.current;
    if (!trigger || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreBots();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(trigger);
    return () => observer.unobserve(trigger);
  }, [hasMore, loadMoreBots]);

  const filteredBots = useMemo(
    () =>
      filterBots(bots, {
        ...filters,
        search: debouncedSearch,
      }),
    [bots, filters, debouncedSearch]
  );

  return (
    <>
      <BotFilters filters={filters} onFiltersChange={setFilters} />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBots.map((bot) => (
            <MemoizedBotItem key={bot.id} bot={bot} onDelete={handleDeleteBot} />
          ))}
        </div>

        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isLoading && <Spinner />}
          </div>
        )}
      </div>
    </>
  );
}
