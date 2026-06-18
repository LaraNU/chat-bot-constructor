import { randomUUID } from 'crypto';

import type { AppNode, AppEdge, StartNodeData } from './types';

interface DefaultFlow {
  nodes: AppNode[];
  edges: AppEdge[];
}

export function createDefaultFlow(): DefaultFlow {
  const startNodeId = randomUUID();

  const startNode: AppNode = {
    id: startNodeId,
    type: 'start',
    position: {
      x: 400,
      y: 100,
    },
    data: {
      startCommand: '/start',
    } satisfies StartNodeData,
  };

  return {
    nodes: [startNode],
    edges: [],
  };
}
