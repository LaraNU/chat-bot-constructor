import type { AppEdge } from '../../model/types';

type OutputRef = {
  source: string;
  sourceHandle?: string | null;
};

export type NodeOutput = {
  source: string;
  /** Null for the single unnamed output of a linear node. */
  sourceHandle: string | null;
  edges: AppEdge[];
};

/**
 * Identity of a node output. React Flow stores a missing handle as `null`,
 * while programmatically created edges may leave it `undefined`; both mean
 * the node's single unnamed output.
 */
function getOutputKey({ source, sourceHandle }: OutputRef): string {
  return JSON.stringify([source, sourceHandle ?? null]);
}

/**
 * Groups edges by the node output they leave from, preserving edge order
 * within each output.
 */
export function groupEdgesByOutput(edges: AppEdge[]): NodeOutput[] {
  const outputsByKey = new Map<string, NodeOutput>();

  for (const edge of edges) {
    const key = getOutputKey(edge);
    const output = outputsByKey.get(key);

    if (output) {
      output.edges.push(edge);
    } else {
      outputsByKey.set(key, {
        source: edge.source,
        sourceHandle: edge.sourceHandle ?? null,
        edges: [edge],
      });
    }
  }

  return [...outputsByKey.values()];
}

/**
 * Whether the given node output already has an outgoing edge. Every output
 * may have at most one edge, so an occupied output cannot accept a new
 * connection. Designed to run on every pointer move while a connection is
 * dragged on the canvas: O(E).
 */
export function isOutputOccupied(edges: AppEdge[], output: OutputRef): boolean {
  const key = getOutputKey(output);

  return edges.some((edge) => getOutputKey(edge) === key);
}
