'use client';

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { NodesPalette } from '@/widgets/nodes-palette';
import { WorkflowCanvas } from '@/widgets/workflow-canvas';
import { PropertiesPanel } from '@/widgets/properties-panel';
import { EditorHeader } from '@/widgets/editor-header';

import { WorkflowStoreProvider } from '@/entities/workflow/model/store';
import { useSelectedNodeId } from '@/entities/workflow/model/store/selectors';
import type { AppEdge, AppNode, CustomAppNode } from '@/entities/workflow/model/types';

import { useAutosave } from '@/features/save-workflow';
import { useMediaQuery } from '@/shared/lib/hooks';
import { MOBILE_MEDIA_QUERY } from '@/shared/config';

type Props = {
  botId: string;
  initialNodes: AppNode[];
  initialEdges: AppEdge[];
  hasToken: boolean;
};

function EditorContent({ botId, hasToken }: { botId: string; hasToken: boolean }) {
  useAutosave({ botId });

  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const selectedNodeId = useSelectedNodeId();

  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const [isPropertiesOpen, setPropertiesOpen] = useState(false);

  // Auto-open the properties sheet the moment a node becomes selected on
  // mobile, without re-triggering on every render while it stays selected.
  const [autoOpenedForNodeId, setAutoOpenedForNodeId] = useState<string | null>(null);

  if (isMobile && selectedNodeId && selectedNodeId !== autoOpenedForNodeId) {
    setAutoOpenedForNodeId(selectedNodeId);
    setPropertiesOpen(true);
  }

  return (
    <div
      className="bg-background flex h-[calc(100vh-3.5rem)] w-full overflow-hidden"
      data-testid="editor-root"
    >
      <NodesPalette isMobile={isMobile} open={isPaletteOpen} onOpenChange={setPaletteOpen} />

      <main className="text-card-foreground relative flex flex-1 flex-col">
        <EditorHeader
          botId={botId}
          hasToken={hasToken}
          isMobile={isMobile}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenProperties={() => setPropertiesOpen(true)}
        />
        <WorkflowCanvas />
      </main>

      <PropertiesPanel
        isMobile={isMobile}
        open={isPropertiesOpen}
        onOpenChange={setPropertiesOpen}
      />
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
