import type { Node, Edge } from "@xyflow/react";
import type {
  AlgorithmRunner,
  AnimationStep,
  NodeAnimationState,
  EdgeAnimationState,
} from "../types/algorithm";

// ── Helpers ───────────────────────────────────────────────────────

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

/** Format distance value for display. */
function fmtDist(d: number): string {
  return d === Infinity ? "∞" : String(d);
}

// ── Bellman-Ford implementation ───────────────────────────────────
export const bellmanFordRunner: AlgorithmRunner = {
  name: "Bellman-Ford Algorithm",

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

    const steps: AnimationStep[] = [];
    let prevNode: Record<string, NodeAnimationState> = {};
    let prevEdge: Record<string, EdgeAnimationState> = {};

    // Distance map and predecessor tracking
    const dist = new Map<string, number>();
    const prev = new Map<string, { nodeId: string; edgeId: string } | null>();

    for (const n of nodes) {
      dist.set(n.id, Infinity);
      prev.set(n.id, null);
    }
    dist.set(startNode.id, 0);

    // Build flat edge list with weights (directed)
    const edgeList = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      weight: Number(e.data?.weight ?? e.label ?? 1),
    }));

    // Step 0 – highlight start node, show initial distances
    {
      const nOver: Record<string, NodeAnimationState> = {
        [startNode.id]: "visiting",
      };
      const s = snap(allNodeIds, allEdgeIds, nOver, {}, prevNode, prevEdge);
      steps.push({
        ...s,
        codeLine: 6,
        description: `Initialize distances: ${startLabel} = 0, all other nodes = infinity.`,
      });
      prevNode = s.nodeStates;
      prevEdge = s.edgeStates;
    }

    const V = nodes.length;

    // ── Main loop: V-1 iterations ────────────────────────────────
    for (let i = 1; i < V; i++) {
      let anyRelaxed = false;

      for (const edge of edgeList) {
        const uDist = dist.get(edge.source)!;
        if (uDist === Infinity) continue; // Can't relax from unreachable node

        const sourceLabel =
          nodes.find((n) => n.id === edge.source)?.data?.label ?? edge.source;
        const targetLabel =
          nodes.find((n) => n.id === edge.target)?.data?.label ?? edge.target;
        const newDist = uDist + edge.weight;
        const oldDist = dist.get(edge.target)!;

        // Show edge being considered (traversing)
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
            codeLine: 8,
            description: `Round ${i}: Check ${sourceLabel} -> ${targetLabel}. Candidate distance is ${newDist}, current distance is ${fmtDist(oldDist)}.`,
          });
          prevNode = s.nodeStates;
          prevEdge = s.edgeStates;
        }

        if (newDist < oldDist) {
          // Relaxation succeeds
          dist.set(edge.target, newDist);
          prev.set(edge.target, { nodeId: edge.source, edgeId: edge.id });
          anyRelaxed = true;

          const eOver: Record<string, EdgeAnimationState> = {
            [edge.id]: "traversed",
          };
          const nOver: Record<string, NodeAnimationState> = {
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
            codeLine: 10,
            description: `Round ${i}: Update distance of ${targetLabel} from ${fmtDist(oldDist)} to ${newDist} via ${sourceLabel}.`,
          });
          prevNode = s.nodeStates;
          prevEdge = s.edgeStates;
        } else {
          // No improvement — reset edge highlight back to previous state
          const eOver: Record<string, EdgeAnimationState> = {
            [edge.id]: prevEdge[edge.id] ?? "default",
          };
          const s = snap(allNodeIds, allEdgeIds, {}, eOver, prevNode, prevEdge);
          steps.push({
            ...s,
            codeLine: 9,
            description: `Round ${i}: No update for ${targetLabel}; ${fmtDist(oldDist)} is still better than ${newDist}.`,
          });
          prevNode = s.nodeStates;
          prevEdge = s.edgeStates;
        }
      }

      // Early exit if no relaxation occurred this iteration
      if (!anyRelaxed) {
        const s = snap(allNodeIds, allEdgeIds, {}, {}, prevNode, prevEdge);
        steps.push({
          ...s,
          codeLine: 14,
          description: `Round ${i}: No distances changed, so Bellman-Ford can stop early.`,
        });
        prevNode = s.nodeStates;
        prevEdge = s.edgeStates;
        break;
      }
    }

    // ── V-th iteration: negative cycle detection ─────────────────
    {
      let negativeCycle = false;
      for (const edge of edgeList) {
        const uDist = dist.get(edge.source)!;
        if (uDist === Infinity) continue;
        if (uDist + edge.weight < dist.get(edge.target)!) {
          negativeCycle = true;
          break;
        }
      }

      if (negativeCycle) {
        const s = snap(allNodeIds, allEdgeIds, {}, {}, prevNode, prevEdge);
        steps.push({
          ...s,
          codeLine: 17,
          description: `A negative cycle is detected. Shortest-path results are not reliable.`,
        });
        return steps;
      }
    }

    // ── Final step: trace and highlight shortest path ────────────
    const endDist = dist.get(endNode.id)!;
    if (endDist === Infinity) {
      const s = snap(allNodeIds, allEdgeIds, {}, {}, prevNode, prevEdge);
      steps.push({
        ...s,
        codeLine: 20,
        description: `No path exists from ${startLabel} to ${endLabel}.`,
      });
      return steps;
    }

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
      codeLine: 20,
      description: `Shortest path is finalized. Distance from ${startLabel} to ${endLabel} is ${endDist}.`,
    });

    return steps;
  },
};
