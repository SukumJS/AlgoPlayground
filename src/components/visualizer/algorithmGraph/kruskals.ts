import type { Node, Edge } from "@xyflow/react";
import type {
  AlgorithmRunner,
  AnimationStep,
  NodeAnimationState,
  EdgeAnimationState,
} from "../types/algorithm";

// ── Helpers ───────────────────────────────────────────────────────

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

// ── Union-Find (Disjoint Set Union) ──────────────────────────────
class UnionFind {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor(nodeIds: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    for (const id of nodeIds) {
      this.parent.set(id, id);
      this.rank.set(id, 0);
    }
  }

  find(x: string): string {
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)!)); // Path compression
    }
    return this.parent.get(x)!;
  }

  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false; // Already connected

    // Union by rank
    const rankX = this.rank.get(rootX)!;
    const rankY = this.rank.get(rootY)!;
    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }
    return true;
  }
}

// ── Kruskal's MST implementation ──────────────────────────────────
export const kruskalsRunner: AlgorithmRunner = {
  name: "Kruskal's Algorithm",

  generateSteps(
    nodes: Node[],
    edges: Edge[],
    _startLabel: string,
    _endLabel: string,
  ): AnimationStep[] {
    if (nodes.length === 0) return [];

    const allNodeIds = nodes.map((n) => n.id);
    const allEdgeIds = edges.map((e) => e.id);

    const steps: AnimationStep[] = [];
    let prevNode: Record<string, NodeAnimationState> = {};
    let prevEdge: Record<string, EdgeAnimationState> = {};

    // Build sorted edge list
    const sortedEdges = [...edges]
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        weight: Number(e.data?.weight ?? e.label ?? 1),
      }))
      .sort((a, b) => a.weight - b.weight);

    // Step 0 – show sorted edges
    {
      const s = snap(allNodeIds, allEdgeIds, {}, {}, prevNode, prevEdge);
      const edgeList = sortedEdges
        .map((e) => {
          const sLabel =
            nodes.find((n) => n.id === e.source)?.data?.label ?? e.source;
          const tLabel =
            nodes.find((n) => n.id === e.target)?.data?.label ?? e.target;
          return `${sLabel}–${tLabel}(${e.weight})`;
        })
        .join(", ");
      steps.push({
        ...s,
        codeLine: 3,
        description: `Sort all edges by weight (smallest first): ${edgeList}`,
      });
      prevNode = s.nodeStates;
      prevEdge = s.edgeStates;
    }

    const uf = new UnionFind(allNodeIds);
    const mstEdgeIds: string[] = [];
    const mstNodeIds = new Set<string>();
    let totalWeight = 0;

    // Process each edge in order
    for (const edge of sortedEdges) {
      const sourceLabel =
        nodes.find((n) => n.id === edge.source)?.data?.label ?? edge.source;
      const targetLabel =
        nodes.find((n) => n.id === edge.target)?.data?.label ?? edge.target;

      // Show edge being considered
      {
        const eOver: Record<string, EdgeAnimationState> = {
          [edge.id]: "traversing",
        };
        const nOver: Record<string, NodeAnimationState> = {
          [edge.source]:
            prevNode[edge.source] === "visited" ? "visited" : "visiting",
          [edge.target]:
            prevNode[edge.target] === "visited" ? "visited" : "visiting",
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
          description: `Check next lightest edge ${sourceLabel} - ${targetLabel} (weight ${edge.weight}) and test for cycle.`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;
      }

      if (uf.union(edge.source, edge.target)) {
        // Edge accepted — no cycle
        mstEdgeIds.push(edge.id);
        mstNodeIds.add(edge.source);
        mstNodeIds.add(edge.target);
        totalWeight += edge.weight;

        const eOver: Record<string, EdgeAnimationState> = {
          [edge.id]: "traversed",
        };
        const nOver: Record<string, NodeAnimationState> = {
          [edge.source]: "visited",
          [edge.target]: "visited",
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
          codeLine: 7,
          description: `No cycle found, so accept ${sourceLabel} - ${targetLabel}. Total MST weight is ${totalWeight}.`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;

        // Check if MST is complete (n-1 edges)
        if (mstEdgeIds.length === nodes.length - 1) break;
      } else {
        // Edge rejected — would create cycle
        // Reset edge back to default (don't keep it highlighted)
        const eOver: Record<string, EdgeAnimationState> = {
          [edge.id]: "default",
        };
        const s = snap(allNodeIds, allEdgeIds, {}, eOver, prevNode, prevEdge);
        steps.push({
          ...s,
          codeLine: 6,
          description: `Reject ${sourceLabel} - ${targetLabel} because it would create a cycle.`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;
      }
    }

    // Final step — highlight entire MST
    {
      const nOver: Record<string, NodeAnimationState> = {};
      for (const id of mstNodeIds) nOver[id] = "target-found";
      const eOver: Record<string, EdgeAnimationState> = {};
      for (const id of mstEdgeIds) eOver[id] = "traversed";

      const s = snap(allNodeIds, allEdgeIds, nOver, eOver, prevNode, prevEdge);
      steps.push({
        ...s,
        codeLine: 11,
        description: `MST complete. We selected ${mstEdgeIds.length} edges with total weight ${totalWeight}.`,
      });
    }

    return steps;
  },
};
