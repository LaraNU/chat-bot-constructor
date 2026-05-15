'use client';

import { NodesPalette } from '@/widgets/nodes-palette';
import { WorkflowCanvas } from '@/widgets/workflow-canvas';
import { PropertiesPanel } from '@/widgets/properties-panel';
import { ReactFlowProvider } from '@xyflow/react';
import { useTranslations } from 'next-intl';

type Props = {
  botId: string;
};

export function WorkflowEditorPage({ botId }: Props) {
  const t = useTranslations('WorkflowEditor');

  return (
    <div
      data-testid="editor-root"
      className="bg-background flex h-[calc(100vh-3.5rem)] w-full overflow-hidden"
    >
      <ReactFlowProvider>
        <NodesPalette />
        <main className="relative flex-1">
          <div className="border-border border-b p-4">
            <h2 className="text-sm font-medium">
              {t('title')} {botId}
            </h2>
          </div>
          <WorkflowCanvas botId={botId} />
        </main>
        <PropertiesPanel />
      </ReactFlowProvider>
    </div>
  );
}
