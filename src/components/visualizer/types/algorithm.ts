import type { Node, Edge } from "@xyflow/react";

// ── Animation states ──────────────────────────────────────────────
export type NodeAnimationState =
  | "default"
  | "visiting"
  | "visited"
  | "target-found";
export type EdgeAnimationState = "default" | "traversing" | "traversed";

// ── Single animation step ─────────────────────────────────────────
export interface AnimationStep {
  /** Map from node id → animation state for this step */
  nodeStates: Record<string, NodeAnimationState>;
  /** Map from edge id → animation state for this step */
  edgeStates: Record<string, EdgeAnimationState>;
  /** Human-readable description of what happens in this step */
  description: string;
}

// ── Algorithm runner contract ─────────────────────────────────────
export interface AlgorithmRunner {
  /** Display name (e.g. "Dijkstra's Algorithm") */
  name: string;
  /**
   * Generate all animation steps given the current graph and start/end.
   * Returns an ordered list of steps that the playback hook will iterate.
   */
  generateSteps(
    nodes: Node[],
    edges: Edge[],
    startLabel: string,
    endLabel: string,
  ): AnimationStep[];
}
