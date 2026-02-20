import { NodesPalette } from '@/widgets/nodes-palette';
import { WorkflowCanvas } from '@/widgets/workflow-canvas';
import { PropertiesPanel } from '@/widgets/properties-panel';
import { ReactFlowProvider } from '@xyflow/react';

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div
      data-testid="editor-root"
      className="bg-background flex h-[calc(100vh-3.5rem)] w-full overflow-hidden"
    >
      <ReactFlowProvider>
        <NodesPalette />
        <main className="relative flex-1">
          <div className="border-border border-b p-4">
            <h2 className="text-sm font-medium">Редактор бота {id}</h2>
          </div>
          <WorkflowCanvas botId={id} />
        </main>
        <PropertiesPanel />
      </ReactFlowProvider>
    </div>
  );
}
