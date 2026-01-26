import { NodesPalette } from '@/widgets/nodes-palette';
import { WorkflowCanvas } from '@/widgets/workflow-canvas';
import { PropertiesPanel } from '@/widgets/properties-panel';

export default function EditorPage() {
  return (
    <div className="bg-background flex h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      <NodesPalette />
      <main className="relative flex-1">
        <WorkflowCanvas />
      </main>
      <PropertiesPanel />
    </div>
  );
}
