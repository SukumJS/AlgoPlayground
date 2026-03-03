/**
 * Shared animation types used across all tree visualizers (BST, AVL, BT, Heap)
 */

import type { Node, Edge } from "@xyflow/react";

export interface AnimationCallbacks {
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  setDescription: (desc: string) => void;
  applyHighlighting: (
    nodes: Node[],
    edges: Edge[],
    highlightedNodeIds: Set<string>,
    highlightedEdgeIds: Set<string>,
    color: string,
    edgeColor?: string,
  ) => { highlightedNodes: Node[]; highlightedEdges: Edge[] };
}
