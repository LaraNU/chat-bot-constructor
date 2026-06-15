'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { NodesPalette } from '@/widgets/nodes-palette';
import { WorkflowCanvas } from '@/widgets/workflow-canvas';
import { PropertiesPanel } from '@/widgets/properties-panel';
import { EditorHeader } from '@/widgets/editor-header';
import type { AppEdge, AppNode } from '@/entities/workflow/model/types';

type Props = {
  botId: string;
  botName: string;
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
  initialToken: string | null;
};

export function WorkflowEditorPage({
  botId,
  botName,
  initialNodes,
  initialEdges,
  initialToken,
}: Props) {
  return (
    <div
      data-testid="editor-root"
      className="bg-background flex h-[calc(100vh-3.5rem)] w-full overflow-hidden"
    >
      <ReactFlowProvider>
        <NodesPalette />

        <main className="text-card-foreground relative flex flex-1 flex-col">
          <EditorHeader botId={botId} botName={botName} initialToken={initialToken} />
          <WorkflowCanvas initialNodes={initialNodes} initialEdges={initialEdges} />
        </main>

        <PropertiesPanel />
      </ReactFlowProvider>
    </div>
  );
}
