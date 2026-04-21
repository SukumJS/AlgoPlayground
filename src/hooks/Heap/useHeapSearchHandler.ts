import { useCallback } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import {
  searchHeap,
  calculateHeapPositions,
  heapToReactFlow,
  type HeapNode,
} from "@/src/components/visualizer/algorithmsTree/heapTree";

export function useHeapSearchHandler(params: {
  heapRoot: HeapNode | null;
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  setCodeStep?: (step: number) => void;
  setStepToCodeLine?: (map: number[]) => void;
  setTreeAction?: (action: string | null) => void;
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
}) {
  const { heapRoot } = params;

  const handleSearch = useCallback(
    (value: number): TreeAnimationStep[] => {
      const stepToLine = [1, 3, 4, 5, 6, 10, 11];
      const treeAction = "heap-search";
      const steps: TreeAnimationStep[] = [];

      if (!heapRoot) {
        steps.push({
          nodes: [],
          edges: [],
          description: "The heap is empty. Insert a node first.",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
        return steps;
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

      // Step 0: Initial state
      steps.push({
        nodes: rfNodes as RFNode[],
        edges: rfEdges as RFEdge[],
        description: `Starting search for ${value} in heap.`,
        codeStep: 0,
        treeAction,
        stepToCodeLine: stepToLine,
      });

      // Steps: BFS traversal
      path.forEach((id, idx) => {
        const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === id,
            highlightColor: n.id === id ? "#62A2F7" : undefined,
          },
        }));
        const visitedIds = new Set(path.slice(0, idx + 1));
        const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => ({
          ...e,
          style:
            visitedIds.has(e.source) && visitedIds.has(e.target)
              ? { stroke: "#F7AD45", strokeWidth: 3 }
              : { stroke: "#999", strokeWidth: 2 },
        }));
        steps.push({
          nodes: highlighted,
          edges: highlightedEdges,
          description: `Searching for ${value}. Step ${idx + 1} of ${path.length} in level order.`,
          codeStep: 2,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      });

      // Result step
      if (found && nodeId) {
        const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? "#4CAF7D" : undefined,
          },
        }));
        steps.push({
          nodes: highlighted,
          edges: rfEdges as RFEdge[],
          description: `Value ${value} found. This is the matching heap node.`,
          codeStep: 4,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      } else {
        steps.push({
          nodes: rfNodes as RFNode[],
          edges: rfEdges as RFEdge[],
          description: `Value ${value} was not found in the heap.`,
          codeStep: 5,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Clean step
      steps.push({
        nodes: rfNodes as RFNode[],
        edges: rfEdges as RFEdge[],
        description: "",
        codeStep: 0,
        treeAction: null,
        stepToCodeLine: stepToLine,
      });

      return steps;
    },
    [heapRoot],
  );

  return { handleSearch };
}
