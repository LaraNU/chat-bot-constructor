'use client';

import { useEffect, useState, useRef, memo, useCallback } from 'react';
import { BotCard } from './bot-card';
import { DeleteBotButton } from '@/features/delete-bot';
import { fetchBotsAction, type SerializedBot } from '../api/actions';
import { Spinner } from '@/shared/ui/spinner';

interface InfiniteBotListProps {
  initialBots: SerializedBot[];
  limit: number;
}

const MemoizedBotItem = memo(({ bot }: { bot: SerializedBot }) => {
  return (
    <BotCard
      id={bot.id}
      name={bot.name}
      updatedAt={bot.updatedAt}
      description={bot.description}
      deleteActionSlot={<DeleteBotButton botId={bot.id} />}
    />
  );
});

MemoizedBotItem.displayName = 'MemoizedBotItem';

export function InfiniteBotList({ initialBots, limit }: InfiniteBotListProps) {
  const [bots, setBots] = useState<SerializedBot[]>(initialBots);
  const [hasMore, setHasMore] = useState(initialBots.length === limit);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bots.map((bot) => (
          <MemoizedBotItem key={bot.id} bot={bot} />
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isLoading && <Spinner />}
        </div>
      )}
    </div>
  );
}
