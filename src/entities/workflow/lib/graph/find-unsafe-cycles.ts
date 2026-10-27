import type { AppEdge, AppNode } from '../../model/types';
import { isWaitingNodeType } from '../../model/node-semantics';

type Adjacency = Map<string, string[]>;

type ConnectionEndpoints = {
  source: string;
  target: string;
};

/**
 * Adjacency of the subgraph that the runtime executes without stopping:
 * only non-waiting nodes and the edges between them. Edges that reference
 * missing nodes are ignored.
 */
function buildNonWaitingAdjacency(nodes: AppNode[], edges: AppEdge[]): Adjacency {
  const adjacency: Adjacency = new Map();

  for (const node of nodes) {
    if (!isWaitingNodeType(node.type)) {
      adjacency.set(node.id, []);
    }
  }

  for (const edge of edges) {
    const targets = adjacency.get(edge.source);

    if (targets && adjacency.has(edge.target)) {
      targets.push(edge.target);
    }
  }

  return adjacency;
}

type TarjanFrame = {
  nodeId: string;
  nextNeighborIndex: number;
};

/**
 * Iterative Tarjan's SCC — avoids call-stack limits on large graphs.
 */
function findStronglyConnectedComponents(adjacency: Adjacency): string[][] {
  const indexById = new Map<string, number>();
  const lowLinkById = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const components: string[][] = [];

  let nextIndex = 0;

  for (const rootId of adjacency.keys()) {
    if (indexById.has(rootId)) {
      continue;
    }

    const callStack: TarjanFrame[] = [{ nodeId: rootId, nextNeighborIndex: 0 }];

    indexById.set(rootId, nextIndex);
    lowLinkById.set(rootId, nextIndex);
    nextIndex++;
    stack.push(rootId);
    onStack.add(rootId);

    while (callStack.length > 0) {
      const frame = callStack[callStack.length - 1];
      const neighbors = adjacency.get(frame.nodeId) ?? [];

      if (frame.nextNeighborIndex < neighbors.length) {
        const neighborId = neighbors[frame.nextNeighborIndex];
        frame.nextNeighborIndex++;

        if (!indexById.has(neighborId)) {
          indexById.set(neighborId, nextIndex);
          lowLinkById.set(neighborId, nextIndex);
          nextIndex++;
          stack.push(neighborId);
          onStack.add(neighborId);
          callStack.push({ nodeId: neighborId, nextNeighborIndex: 0 });
        } else if (onStack.has(neighborId)) {
          lowLinkById.set(
            frame.nodeId,
            Math.min(lowLinkById.get(frame.nodeId)!, indexById.get(neighborId)!)
          );
        }

        continue;
      }

      callStack.pop();

      const parent = callStack[callStack.length - 1];

      if (parent) {
        lowLinkById.set(
          parent.nodeId,
          Math.min(lowLinkById.get(parent.nodeId)!, lowLinkById.get(frame.nodeId)!)
        );
      }

      if (lowLinkById.get(frame.nodeId) === indexById.get(frame.nodeId)) {
        const component: string[] = [];
        let memberId: string | undefined;

        do {
          memberId = stack.pop()!;
          onStack.delete(memberId);
          component.push(memberId);
        } while (memberId !== frame.nodeId);

        components.push(component);
      }
    }
  }

  return components;
}

/**
 * Returns ids of nodes that belong to a directed cycle consisting only of
 * nodes that do not wait for user input. The runtime would execute such a
 * cycle forever within a single update.
 *
 * All outgoing edges are considered (e.g. both branches of a condition).
 */
export function findNodesInUnsafeCycles(nodes: AppNode[], edges: AppEdge[]): Set<string> {
  const adjacency = buildNonWaitingAdjacency(nodes, edges);
  const result = new Set<string>();

  for (const component of findStronglyConnectedComponents(adjacency)) {
    const [singleNodeId] = component;
    const isSelfLoop =
      component.length === 1 && (adjacency.get(singleNodeId) ?? []).includes(singleNodeId);

    if (component.length > 1 || isSelfLoop) {
      for (const nodeId of component) {
        result.add(nodeId);
      }
    }
  }

  return result;
}

/**
 * Whether adding an edge `source → target` would close a cycle without a
 * waiting node. Designed to run on every pointer move while a connection is
 * dragged on the canvas: O(V + E).
 */
export function wouldCreateUnsafeCycle(
  nodes: AppNode[],
  edges: AppEdge[],
  { source, target }: ConnectionEndpoints
): boolean {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const sourceNode = nodesById.get(source);
  const targetNode = nodesById.get(target);

  if (!sourceNode || !targetNode) {
    return false;
  }

  if (isWaitingNodeType(sourceNode.type) || isWaitingNodeType(targetNode.type)) {
    return false;
  }

  if (source === target) {
    return true;
  }

  const adjacency = buildNonWaitingAdjacency(nodes, edges);
  const visited = new Set<string>([target]);
  const queue: string[] = [target];

  for (let head = 0; head < queue.length; head++) {
    for (const neighborId of adjacency.get(queue[head]) ?? []) {
      if (neighborId === source) {
        return true;
      }

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
      }
    }
  }

  return false;
}
