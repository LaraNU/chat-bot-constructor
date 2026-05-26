'use client';

import { memo } from 'react';
import { Pencil, Trash } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Logo } from '@/shared/ui/icons/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Link } from '@/i18n/navigation';
import type { ReactNode } from 'react';

type BotCardProps = {
  id: string;
  name: string;
  status?: 'active' | 'draft';
  updatedAt: string;
  description: string | null;
  deleteActionSlot?: ReactNode;
};

export const BotCard = memo(
  ({ id, name, status = 'draft', updatedAt, description, deleteActionSlot }: BotCardProps) => {
    const t = useTranslations('BotCard');
    const formatter = useFormatter();

    return (
      <Card className="group hover:border-foreground/20 relative overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Logo className="min-w-10" />
              <div>
                <CardTitle className="text-base font-medium">{name}</CardTitle>
                {description && (
                  <CardDescription className="mt-0.5 line-clamp-1 text-xs">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <Badge
              variant={status === 'active' ? 'default' : 'secondary'}
              className={
                status === 'active' ? 'bg-success/15 text-success hover:bg-success/20' : ''
              }
            >
              {status === 'active' ? t('active') : t('draft')}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {t('lastUpdated')}{' '}
              {formatter.dateTime(new Date(updatedAt), {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
              <Link href={`/editor/${id}`}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                {t('edit')}
              </Link>
            </Button>

            {deleteActionSlot ?? (
              <Button variant="secondary" size="sm" className="flex-1">
                <Trash className="mr-2 h-3.5 w-3.5" />
                {t('delete')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

BotCard.displayName = 'BotCard';
