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
  weight: number;
  edgeId: string;
}

/**
 * Build an **undirected weighted** adjacency list — every edge appears in both directions.
 */
function buildUndirectedWeightedAdjList(
  edges: Edge[],
): Map<string, AdjEntry[]> {
  const adj = new Map<string, AdjEntry[]>();
  for (const edge of edges) {
    const weight = Number(edge.data?.weight ?? edge.label ?? 1);
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    if (!adj.has(edge.target)) adj.set(edge.target, []);
    adj
      .get(edge.source)!
      .push({ targetId: edge.target, weight, edgeId: edge.id });
    adj
      .get(edge.target)!
      .push({ targetId: edge.source, weight, edgeId: edge.id });
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

// ── Prim's MST implementation ─────────────────────────────────────
export const primsRunner: AlgorithmRunner = {
  name: "Prim's Algorithm",

  generateSteps(
    nodes: Node[],
    edges: Edge[],
    startLabel: string,
    _endLabel: string,
  ): AnimationStep[] {
    const startNode = findNodeByLabel(nodes, startLabel);
    if (!startNode) return [];

    const allNodeIds = nodes.map((n) => n.id);
    const allEdgeIds = edges.map((e) => e.id);
    const adj = buildUndirectedWeightedAdjList(edges);

    const steps: AnimationStep[] = [];
    let prevNode: Record<string, NodeAnimationState> = {};
    let prevEdge: Record<string, EdgeAnimationState> = {};

    // MST tracking
    const inMST = new Set<string>();
    const mstEdgeIds: string[] = [];
    let totalWeight = 0;

    // Step 0 – highlight start node
    {
      inMST.add(startNode.id);
      const nOver: Record<string, NodeAnimationState> = {
        [startNode.id]: "visiting",
      };
      const s = snap(allNodeIds, allEdgeIds, nOver, {}, prevNode, prevEdge);
      steps.push({
        ...s,
        codeLine: 3,
        description: `Start Prim's algorithm from node ${startLabel}. This is the first node in the MST.`,
      });
      prevNode = s.nodeStates;
      prevEdge = s.edgeStates;
    }

    // Main loop — keep adding cheapest edge crossing the cut
    while (inMST.size < nodes.length) {
      let bestEdgeId: string | null = null;
      let bestTargetId: string | null = null;
      let bestWeight = Infinity;
      let bestSourceId: string | null = null;

      // Find minimum weight edge from MST to non-MST
      for (const nodeId of inMST) {
        const neighbours = adj.get(nodeId) ?? [];
        for (const { targetId, weight, edgeId } of neighbours) {
          if (!inMST.has(targetId) && weight < bestWeight) {
            bestWeight = weight;
            bestEdgeId = edgeId;
            bestTargetId = targetId;
            bestSourceId = nodeId;
          }
        }
      }

      if (!bestEdgeId || !bestTargetId || !bestSourceId) break; // No more reachable nodes

      const sourceLabel =
        nodes.find((n) => n.id === bestSourceId)?.data?.label ?? bestSourceId;
      const targetLabel =
        nodes.find((n) => n.id === bestTargetId)?.data?.label ?? bestTargetId;

      // Show edge being considered
      {
        const eOver: Record<string, EdgeAnimationState> = {
          [bestEdgeId]: "traversing",
        };
        const nOver: Record<string, NodeAnimationState> = {
          [bestTargetId]: "visiting",
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
          codeLine: 5,
          description: `Choose the lightest edge crossing the cut: ${sourceLabel} - ${targetLabel} (weight ${bestWeight}).`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;
      }

      // Add to MST
      inMST.add(bestTargetId);
      mstEdgeIds.push(bestEdgeId);
      totalWeight += bestWeight;

      {
        const eOver: Record<string, EdgeAnimationState> = {
          [bestEdgeId]: "traversed",
        };
        const nOver: Record<string, NodeAnimationState> = {
          [bestTargetId]: "visited",
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
          codeLine: 6,
          description: `Add ${sourceLabel} - ${targetLabel} to the MST and include node ${targetLabel}. Total weight is now ${totalWeight}.`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;
      }
    }

    // Final step — highlight entire MST
    {
      const nOver: Record<string, NodeAnimationState> = {};
      for (const id of inMST) nOver[id] = "target-found";
      const eOver: Record<string, EdgeAnimationState> = {};
      for (const id of mstEdgeIds) eOver[id] = "traversed";

      const s = snap(allNodeIds, allEdgeIds, nOver, eOver, prevNode, prevEdge);
      steps.push({
        ...s,
        codeLine: 9,
        description: `MST complete. All reachable nodes are connected with minimum total weight ${totalWeight}.`,
      });
    }

    return steps;
  },
};
