/**
 * Shared animation types used across all tree visualizers (BST, AVL, BT, Heap)
 */

export interface AnimationCallbacks {
    setNodes: (nodes: any) => void;
    setEdges: (edges: any) => void;
    setDescription: (desc: string) => void;
    applyHighlighting: (
        nodes: any[],
        edges: any[],
        highlightedNodeIds: Set<string>,
        highlightedEdgeIds: Set<string>,
        color: string,
        edgeColor?: string
    ) => { highlightedNodes: any[]; highlightedEdges: any[] };
}
