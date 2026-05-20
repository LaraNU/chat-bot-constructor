'use client';

import { useTranslations } from 'next-intl';
import { ReactFlowProvider } from '@xyflow/react';
import { NodesPalette } from '@/widgets/nodes-palette';
import { WorkflowCanvas } from '@/widgets/workflow-canvas';
import { PropertiesPanel } from '@/widgets/properties-panel';
import type { AppEdge, AppNode } from '@/entities/workflow/model/types';

type Props = {
  botId: string;
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
};

export function WorkflowEditorPage({ botId, initialNodes, initialEdges }: Props) {
  const t = useTranslations('WorkflowEditor');

  return (
    <div
      data-testid="editor-root"
      className="bg-background flex h-[calc(100vh-3.5rem)] w-full overflow-hidden"
    >
      <ReactFlowProvider>
        <NodesPalette />
        <main className="text-card-foreground relative flex-1">
          <div className="border-border border-b p-4">
            <h2 className="text-sm font-medium">
              {t('title')} {botId}
            </h2>
          </div>
          <WorkflowCanvas botId={botId} initialNodes={initialNodes} initialEdges={initialEdges} />
        </main>
        <PropertiesPanel />
      </ReactFlowProvider>
    </div>
  );
}
