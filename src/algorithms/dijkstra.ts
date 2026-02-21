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

function buildAdjacencyList(edges: Edge[]): Map<string, AdjEntry[]> {
  const adj = new Map<string, AdjEntry[]>();
  for (const edge of edges) {
    const weight = Number(edge.data?.weight ?? edge.label ?? 1);
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push({
      targetId: edge.target,
      weight,
      edgeId: edge.id,
    });
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
): { nodeStates: Record<string, NodeAnimationState>; edgeStates: Record<string, EdgeAnimationState> } {
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

// ── Dijkstra implementation ───────────────────────────────────────
export const dijkstraRunner: AlgorithmRunner = {
  name: "Dijkstra's Algorithm",

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
    const adj = buildAdjacencyList(edges);

    const steps: AnimationStep[] = [];
    let prevNode: Record<string, NodeAnimationState> = {};
    let prevEdge: Record<string, EdgeAnimationState> = {};

    // Distance map and visited set
    const dist = new Map<string, number>();
    const prev = new Map<string, { nodeId: string; edgeId: string } | null>();
    const visited = new Set<string>();

    for (const n of nodes) {
      dist.set(n.id, Infinity);
      prev.set(n.id, null);
    }
    dist.set(startNode.id, 0);

    // Step 0 – highlight start node
    {
      const nOver: Record<string, NodeAnimationState> = { [startNode.id]: "visiting" };
      const s = snap(allNodeIds, allEdgeIds, nOver, {}, prevNode, prevEdge);
      steps.push({ ...s, description: `Start at node ${startLabel} (distance = 0)` });
      prevNode = s.nodeStates;
      prevEdge = s.edgeStates;
    }

    // Main loop
    while (true) {
      // Pick unvisited node with smallest distance
      let currentId: string | null = null;
      let currentDist = Infinity;
      for (const [id, d] of dist) {
        if (!visited.has(id) && d < currentDist) {
          currentDist = d;
          currentId = id;
        }
      }

      if (currentId === null) break; // no more reachable nodes

      visited.add(currentId);

      // Mark current node as visited (blue)
      if (currentId !== startNode.id) {
        const currentLabel = nodes.find((n) => n.id === currentId)?.data?.label ?? currentId;
        const nOver: Record<string, NodeAnimationState> = { [currentId]: "visited" };
        // Also mark the edge that led here as traversed
        const eOver: Record<string, EdgeAnimationState> = {};
        const predecessor = prev.get(currentId);
        if (predecessor) {
          eOver[predecessor.edgeId] = "traversed";
        }
        const s = snap(allNodeIds, allEdgeIds, nOver, eOver, prevNode, prevEdge);
        steps.push({
          ...s,
          description: `Visit node ${currentLabel} (distance = ${currentDist})`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;
      }

      // If we reached the target, emit final step
      if (currentId === endNode.id) {
        // Trace the shortest path
        const pathNodeIds: string[] = [];
        const pathEdgeIds: string[] = [];
        let traceId: string | null = endNode.id;
        while (traceId) {
          pathNodeIds.push(traceId);
          const p = prev.get(traceId);
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

        const s = snap(allNodeIds, allEdgeIds, nOver, eOver, prevNode, prevEdge);
        steps.push({
          ...s,
          description: `Target found! Shortest path to ${endLabel} has distance ${currentDist}`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;
        break;
      }

      // Relax neighbours
      const neighbours = adj.get(currentId) ?? [];
      for (const { targetId, weight, edgeId } of neighbours) {
        if (visited.has(targetId)) continue;

        const newDist = currentDist + weight;
        const targetLabel = nodes.find((n) => n.id === targetId)?.data?.label ?? targetId;
        const currentLabel = nodes.find((n) => n.id === currentId)?.data?.label ?? currentId;

        // Show edge being explored
        const eOver: Record<string, EdgeAnimationState> = { [edgeId]: "traversing" };
        const nOver: Record<string, NodeAnimationState> = {};

        if (newDist < dist.get(targetId)!) {
          dist.set(targetId, newDist);
          prev.set(targetId, { nodeId: currentId, edgeId });
          nOver[targetId] = "visiting";
          const s = snap(allNodeIds, allEdgeIds, nOver, eOver, prevNode, prevEdge);
          steps.push({
            ...s,
            description: `Relax edge ${currentLabel} → ${targetLabel}: distance updated to ${newDist}`,
          });
          prevNode = s.nodeStates;
          prevEdge = s.edgeStates;
        } else {
          const s = snap(allNodeIds, allEdgeIds, nOver, eOver, prevNode, prevEdge);
          steps.push({
            ...s,
            description: `Edge ${currentLabel} → ${targetLabel}: no improvement (${newDist} ≥ ${dist.get(targetId)!})`,
          });
          prevNode = s.nodeStates;
          prevEdge = s.edgeStates;
        }
      }
    }

    return steps;
  },
};
