import { useWorkflowStore } from './use-workflow-store';

export const useWorkflowNodes = () => useWorkflowStore((state) => state.nodes);

export const useWorkflowEdges = () => useWorkflowStore((state) => state.edges);

export const useIsDirty = () => useWorkflowStore((state) => state.isDirty);

export const useIsSaving = () => useWorkflowStore((state) => state.isSaving);

export const useSelectedNodeId = () => useWorkflowStore((state) => state.selectedNodeId);

export const useSelectedNode = () =>
  useWorkflowStore((state) => {
    if (!state.selectedNodeId) {
      return null;
    }

    return state.nodes.find((node) => node.id === state.selectedNodeId) ?? null;
  });

export const useNodeById = (id: string) =>
  useWorkflowStore((state) => state.nodes.find((node) => node.id === id) ?? null);
