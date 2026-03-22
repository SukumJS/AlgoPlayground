import { useCallback } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import {
  searchHeap,
  calculateHeapPositions,
  heapToReactFlow,
  type HeapNode,
} from "@/src/components/visualizer/algorithmsTree/heapTree";

/**
 * Hook: Heap Search Handler
 * - Node highlight: current node ONLY (not persisted)
 * - Edge highlight: accumulated path (persisted), color #F7AD45
 */
export function useHeapSearchHandler(params: {
  heapRoot: HeapNode | null;
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
}) {
  const {
    heapRoot,
    setNodes,
    setEdges,
    setDescription,
    animationSpeed,
    isPausedRef,
    setIsAnimating,
  } = params;

  const handleSearch = useCallback(
    (value: number) => {
      const controller = new AnimationController(isPausedRef);
      setIsAnimating(true);
      if (!heapRoot) {
        setDescription("The heap is empty. Insert a node first.");
        setIsAnimating(false);
        return;
      }

      const { found, nodeId, path } = searchHeap(heapRoot, value);
      const positions = calculateHeapPositions(heapRoot);
      const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(
        heapRoot,
        [],
        [],
        positions,
        "heap-edge",
      );

      // Animate BFS traversal — only current node highlighted, edges accumulated
      path.forEach((id, idx) => {
        controller.scheduleStep(
          () => {
            // Node: highlight ONLY current node
            const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
              ...n,
              data: {
                ...n.data,
                isHighlighted: n.id === id,
                highlightColor: n.id === id ? "#62A2F7" : undefined,
              },
            }));
            // Edges: accumulate highlighted path
            const visitedIds = new Set(path.slice(0, idx + 1));
            const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => ({
              ...e,
              style:
                visitedIds.has(e.source) && visitedIds.has(e.target)
                  ? { stroke: "#F7AD45", strokeWidth: 3 }
                  : { stroke: "#999", strokeWidth: 2 },
            }));
            setNodes(highlighted);
            setEdges(highlightedEdges);
            setDescription(
              `Searching for ${value}. Step ${idx + 1} of ${path.length} in level order.`,
            );
          },
          animationSpeed * (idx + 1),
        );
      });

      // Show result
      controller.scheduleStep(
        () => {
          if (found && nodeId) {
            const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
              ...n,
              data: {
                ...n.data,
                isHighlighted: n.id === nodeId,
                highlightColor: n.id === nodeId ? "#4CAF7D" : undefined,
              },
            }));
            setNodes(highlighted);
            setDescription(
              `Value ${value} found. This is the matching heap node.`,
            );
          } else {
            setNodes(rfNodes as RFNode[]);
            setDescription(`Value ${value} was not found in the heap.`);
          }
          setEdges(rfEdges as RFEdge[]);

          // Clear
          controller.scheduleStep(() => {
            setNodes(rfNodes as RFNode[]);
            setEdges(rfEdges as RFEdge[]);
            setDescription("");
            setIsAnimating(false);
          }, animationSpeed * 2);
        },
        animationSpeed * (path.length + 1),
      );
    },
    [
      heapRoot,
      setNodes,
      setEdges,
      setDescription,
      animationSpeed,
      isPausedRef,
      setIsAnimating,
    ],
  );

  return { handleSearch };
}
