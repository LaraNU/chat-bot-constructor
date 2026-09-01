'use client';

import { ReactFlowProvider } from '@xyflow/react';

import { NodesPalette } from '@/widgets/nodes-palette';
import { WorkflowCanvas } from '@/widgets/workflow-canvas';
import { PropertiesPanel } from '@/widgets/properties-panel';
import { EditorHeader } from '@/widgets/editor-header';

import { WorkflowStoreProvider } from '@/entities/workflow/model/store';
import type { AppEdge, AppNode, CustomAppNode } from '@/entities/workflow/model/types';

import { useAutosave } from '@/features/save-workflow';

type Props = {
  botId: string;
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
  hasToken: boolean;
};

function EditorContent({ botId, hasToken }: { botId: string; hasToken: boolean }) {
  useAutosave({ botId });

  return (
    <div
      className="bg-background flex h-[calc(100vh-3.5rem)] w-full overflow-hidden"
      data-testid="editor-root"
    >
      <NodesPalette />

      <main className="text-card-foreground relative flex flex-1 flex-col">
        <EditorHeader botId={botId} hasToken={hasToken} />
        <WorkflowCanvas />
      </main>

      <PropertiesPanel />
    </div>
  );
}

export function WorkflowEditorPage({ botId, initialNodes, initialEdges, hasToken }: Props) {
  return (
    <WorkflowStoreProvider nodes={initialNodes as CustomAppNode[]} edges={initialEdges}>
      <ReactFlowProvider>
        <EditorContent botId={botId} hasToken={hasToken} />
      </ReactFlowProvider>
    </WorkflowStoreProvider>
  );
}
