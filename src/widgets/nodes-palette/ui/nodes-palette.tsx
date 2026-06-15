'use client';

import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';
import { WORKFLOW_NODES_CONFIG } from '@/entities/workflow';
import {
  Play,
  MessageSquare,
  GitBranch,
  StopCircle,
  ListChecks,
  CircleHelp,
  ClipboardList,
} from 'lucide-react';
import { DragEvent } from 'react';
import { Heading } from '@/shared/ui/typography';

const ICON_MAP = {
  play: Play,
  message: MessageSquare,
  question: CircleHelp,
  choice: ListChecks,
  branch: GitBranch,
  stop: StopCircle,
  summary: ClipboardList,
};

export function NodesPalette() {
  const t = useTranslations('WorkflowEditor');
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="border-border bg-card flex w-64 flex-col border-r">
      <div className="border-border border-b p-4">
        <Heading level={4}>{t('plaletteTitle')}</Heading>
        <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
      </div>

      <div className="space-y-2 p-3">
        {Object.entries(WORKFLOW_NODES_CONFIG).map(([type, config]) => {
          const Icon = ICON_MAP[config.iconName];

          return (
            type !== 'start' && (
              <div
                key={type}
                className={cn(
                  'group bg-background flex cursor-grab items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-md active:cursor-grabbing',
                  'hover:border-foreground/20'
                )}
                onDragStart={(event) => onDragStart(event, type)}
                draggable
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-md border ${config.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t(`${config.translationKey}.name`)}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {t(`${config.translationKey}.description`)}
                  </p>
                </div>
              </div>
            )
          );
        })}
      </div>
    </aside>
  );
}
