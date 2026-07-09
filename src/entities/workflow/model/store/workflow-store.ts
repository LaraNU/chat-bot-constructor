import { createStore } from 'zustand/vanilla';
import { addEdge, applyNodeChanges, type Connection, type NodeChange } from '@xyflow/react';

import type { AppEdge, CustomAppNode, NodeDataUpdatePayload } from '../types';

export interface WorkflowState {
  nodes: CustomAppNode[];
  edges: AppEdge[];
  selectedNodeId: string | null;
  /** True when in-memory graph differs from the last persisted version. */
  isDirty: boolean;
}

export interface WorkflowActions {
  setNodes: (updater: CustomAppNode[] | ((nodes: CustomAppNode[]) => CustomAppNode[])) => void;
  setEdges: (updater: AppEdge[] | ((edges: AppEdge[]) => AppEdge[])) => void;
  selectNode: (nodeId: string | null) => void;
  updateNode: (nodeId: string, data: NodeDataUpdatePayload) => void;
  deleteNode: (nodeId: string) => void;
  connectNodes: (connection: Connection) => void;
  deleteEdge: (edgeId: string) => void;
  onNodesChange: (changes: NodeChange<CustomAppNode>[]) => void;
  /** Called by the save feature after a successful persist. Resets isDirty to false. */
  markClean: () => void;
}

export type WorkflowStore = WorkflowState & WorkflowActions;

function updateNodeData<T extends CustomAppNode>(node: T, newData: NodeDataUpdatePayload): T {
  return {
    ...node,
    data: {
      ...node.data,
      ...newData,
    },
  } as T;
}

interface CreateWorkflowStoreParams {
  nodes: CustomAppNode[];
  edges: AppEdge[];
}

export const createWorkflowStore = ({ nodes, edges }: CreateWorkflowStoreParams) =>
  createStore<WorkflowStore>()((set) => ({
    nodes,
    edges,
    selectedNodeId: null,
    isDirty: false,

    setNodes: (updater) =>
      set((state) => ({
        nodes: typeof updater === 'function' ? updater(state.nodes) : updater,
        isDirty: true,
      })),

    setEdges: (updater) =>
      set((state) => ({
        edges: typeof updater === 'function' ? updater(state.edges) : updater,
        isDirty: true,
      })),

    selectNode: (nodeId) =>
      set({
        selectedNodeId: nodeId,
      }),

    updateNode: (nodeId, data) =>
      set((state) => ({
        nodes: state.nodes.map((node) => (node.id === nodeId ? updateNodeData(node, data) : node)),
        isDirty: true,
      })),

    deleteNode: (nodeId) =>
      set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        isDirty: true,
      })),

    connectNodes: (connection) =>
      set((state) => ({
        edges: addEdge(
          {
            ...connection,
            type: 'custom',
            animated: false,
          },
          state.edges
        ),
        isDirty: true,
      })),

    deleteEdge: (edgeId) =>
      set((state) => ({
        edges: state.edges.filter((edge) => edge.id !== edgeId),
        isDirty: true,
      })),

    onNodesChange: (changes) =>
      set((state) => {
        const nodes = applyNodeChanges(changes, state.nodes);
        const selectedNode = nodes.find((node) => node.selected);

        return {
          nodes,
          selectedNodeId: selectedNode?.id ?? null,
          isDirty: true,
        };
      }),

    markClean: () => set({ isDirty: false }),
  }));
