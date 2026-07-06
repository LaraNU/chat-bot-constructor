import { useWorkflowStore } from './use-workflow-store';

export const useSetNodes = () => useWorkflowStore((state) => state.setNodes);

export const useSetEdges = () => useWorkflowStore((state) => state.setEdges);

export const useSelectNode = () => useWorkflowStore((state) => state.selectNode);

export const useUpdateNode = () => useWorkflowStore((state) => state.updateNode);

export const useDeleteNode = () => useWorkflowStore((state) => state.deleteNode);

export const useConnectNodes = () => useWorkflowStore((state) => state.connectNodes);

export const useDeleteEdge = () => useWorkflowStore((state) => state.deleteEdge);

export const useNodesChange = () => useWorkflowStore((state) => state.onNodesChange);
