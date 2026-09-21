'use client';

import { cn } from '@/shared/lib/utils';
import { useTranslations } from 'next-intl';
import { WORKFLOW_NODES_CONFIG, WorkflowNodeIcon } from '@/entities/workflow';
import type { WorkflowNodeType } from '@/entities/workflow';
import { useSetNodes } from '@/entities/workflow/model/store';
import { DragEvent } from 'react';
import { Heading } from '@/shared/ui/typography';
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/sheet';
import { useCanvasDragDrop } from '@/features/drag-drop-node';
import { useMediaQuery } from '@/shared/lib/hooks';

const COARSE_POINTER_QUERY = '(pointer: coarse)';

type Props = {
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NodesPalette({ isMobile, open, onOpenChange }: Props) {
  const t = useTranslations('WorkflowEditor');
  const setNodes = useSetNodes();
  const { onTapAdd } = useCanvasDragDrop(setNodes);
  const isCoarsePointer = useMediaQuery(COARSE_POINTER_QUERY);

  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onTap = (nodeType: WorkflowNodeType) => {
    onTapAdd(nodeType);
    onOpenChange(false);
  };

  const nodesList = (
    <div className="space-y-2 p-3">
      {Object.entries(WORKFLOW_NODES_CONFIG).map(([type, config]) => {
        const nodeType = type as WorkflowNodeType;

        return (
          type !== 'start' && (
            <div
              key={type}
              className={cn(
                'group bg-background flex cursor-grab items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-md active:cursor-grabbing',
                'hover:border-foreground/20'
              )}
              onDragStart={(event) => onDragStart(event, type)}
              onClick={isCoarsePointer ? () => onTap(nodeType) : undefined}
              draggable
            >
              <WorkflowNodeIcon type={nodeType} size="md" />
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
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="gap-0 p-0">
          <div className="border-border border-b p-4">
            <SheetTitle className="text-lg font-medium">{t('plaletteTitle')}</SheetTitle>
            <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
          </div>
          {nodesList}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="border-border bg-card flex w-64 flex-col border-r">
      <div className="border-border border-b p-4">
        <Heading level={4}>{t('plaletteTitle')}</Heading>
        <p className="text-muted-foreground mt-1 text-xs">{t('description')}</p>
      </div>
      {nodesList}
    </aside>
  );
}
