import type { Node, Edge } from "@xyflow/react";
import type {
  AlgorithmRunner,
  AnimationStep,
  NodeAnimationState,
  EdgeAnimationState,
} from "../types/algorithm";

// ── Helpers ───────────────────────────────────────────────────────
interface AdjEntry {
  targetId: string;
  edgeId: string;
}

/**
 * Build an **undirected** adjacency list — every edge appears in both directions.
 */
function buildUndirectedAdjList(edges: Edge[]): Map<string, AdjEntry[]> {
  const adj = new Map<string, AdjEntry[]>();
  for (const edge of edges) {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    if (!adj.has(edge.target)) adj.set(edge.target, []);
    adj.get(edge.source)!.push({ targetId: edge.target, edgeId: edge.id });
    adj.get(edge.target)!.push({ targetId: edge.source, edgeId: edge.id });
  }
  return adj;
}

/** Find the node whose *label* matches the given value. */
function findNodeByLabel(nodes: Node[], label: string): Node | undefined {
  return nodes.find((n) => String(n.data?.label) === label);
}

/** Create a snapshot helper that carries forward previous states. */
function snap(
  allNodeIds: string[],
  allEdgeIds: string[],
  nodeOverrides: Record<string, NodeAnimationState>,
  edgeOverrides: Record<string, EdgeAnimationState>,
  prevNodeStates: Record<string, NodeAnimationState>,
  prevEdgeStates: Record<string, EdgeAnimationState>,
): {
  nodeStates: Record<string, NodeAnimationState>;
  edgeStates: Record<string, EdgeAnimationState>;
} {
  const nodeStates: Record<string, NodeAnimationState> = {};
  for (const id of allNodeIds) {
    nodeStates[id] = nodeOverrides[id] ?? prevNodeStates[id] ?? "default";
  }
  const edgeStates: Record<string, EdgeAnimationState> = {};
  for (const id of allEdgeIds) {
    edgeStates[id] = edgeOverrides[id] ?? prevEdgeStates[id] ?? "default";
  }
  return { nodeStates, edgeStates };
}

// ── DFS implementation (iterative with explicit stack) ────────────
export const dfsRunner: AlgorithmRunner = {
  name: "Depth-First Search",

  generateSteps(
    nodes: Node[],
    edges: Edge[],
    startLabel: string,
    endLabel: string,
  ): AnimationStep[] {
    const startNode = findNodeByLabel(nodes, startLabel);
    const endNode = findNodeByLabel(nodes, endLabel);
    if (!startNode || !endNode) return [];

    const allNodeIds = nodes.map((n) => n.id);
    const allEdgeIds = edges.map((e) => e.id);
    const adj = buildUndirectedAdjList(edges);

    const steps: AnimationStep[] = [];
    let prevNode: Record<string, NodeAnimationState> = {};
    let prevEdge: Record<string, EdgeAnimationState> = {};

    const visited = new Set<string>();
    const parent = new Map<string, { nodeId: string; edgeId: string } | null>();
    // Stack stores { nodeId, parentEdgeId? }
    const stack: Array<{ nodeId: string; parentEdgeId: string | null }> = [];

    // Step 0 – highlight start node
    parent.set(startNode.id, null);
    stack.push({ nodeId: startNode.id, parentEdgeId: null });
    {
      const nOver: Record<string, NodeAnimationState> = {
        [startNode.id]: "visiting",
      };
      const s = snap(allNodeIds, allEdgeIds, nOver, {}, prevNode, prevEdge);
      steps.push({
        ...s,
        codeLine: 2,
        description: `Start DFS from node ${startLabel}. Push it onto the stack.`,
      });
      prevNode = s.nodeStates;
      prevEdge = s.edgeStates;
    }

    // Main DFS loop (iterative)
    while (stack.length > 0) {
      const { nodeId: currentId, parentEdgeId } = stack.pop()!;

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const currentLabel =
        nodes.find((n) => n.id === currentId)?.data?.label ?? currentId;

      // Mark current as visited
      {
        const nOver: Record<string, NodeAnimationState> = {
          [currentId]: "visited",
        };
        const eOver: Record<string, EdgeAnimationState> = {};
        if (parentEdgeId) {
          eOver[parentEdgeId] = "traversed";
        }
        const s = snap(
          allNodeIds,
          allEdgeIds,
          nOver,
          eOver,
          prevNode,
          prevEdge,
        );
        steps.push({
          ...s,
          codeLine: 4,
          description: `Pop node ${currentLabel} from the stack and mark it as visited.`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;
      }

      // Check if target found
      if (currentId === endNode.id) {
        // Trace path back
        const pathNodeIds: string[] = [];
        const pathEdgeIds: string[] = [];
        let traceId: string | null = endNode.id;
        while (traceId) {
          pathNodeIds.push(traceId);
          const p = parent.get(traceId);
          if (p) {
            pathEdgeIds.push(p.edgeId);
            traceId = p.nodeId;
          } else {
            traceId = null;
          }
        }

        const nOver: Record<string, NodeAnimationState> = {};
        for (const id of pathNodeIds) nOver[id] = "target-found";
        const eOver: Record<string, EdgeAnimationState> = {};
        for (const id of pathEdgeIds) eOver[id] = "traversed";

        const s = snap(
          allNodeIds,
          allEdgeIds,
          nOver,
          eOver,
          prevNode,
          prevEdge,
        );
        steps.push({
          ...s,
          codeLine: 10,
          description: `Target node ${endLabel} is reached. Trace back through parents to highlight the path.`,
        });
        break;
      }

      // Push neighbours onto stack
      const neighbours = adj.get(currentId) ?? [];
      for (const { targetId, edgeId } of neighbours) {
        if (visited.has(targetId)) continue;

        // Record parent for path tracing (first discovery wins)
        if (!parent.has(targetId)) {
          parent.set(targetId, { nodeId: currentId, edgeId });
        }
        stack.push({
          nodeId: targetId,
          parentEdgeId: edgeId,
        });

        const targetLabel =
          nodes.find((n) => n.id === targetId)?.data?.label ?? targetId;

        // Show edge being explored + neighbour pushed
        const eOver: Record<string, EdgeAnimationState> = {
          [edgeId]: "traversing",
        };
        const nOver: Record<string, NodeAnimationState> = {
          [targetId]: "visiting",
        };
        const s = snap(
          allNodeIds,
          allEdgeIds,
          nOver,
          eOver,
          prevNode,
          prevEdge,
        );
        steps.push({
          ...s,
          codeLine: 12,
          description: `Explore ${currentLabel} -> ${targetLabel}. ${targetLabel} is unvisited, so push it onto the stack.`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;
      }
    }

    return steps;
  },
};
