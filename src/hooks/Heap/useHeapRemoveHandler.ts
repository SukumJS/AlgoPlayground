import { useCallback } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import {
  searchHeap,
  removeHeap,
  cloneHeap,
  calculateHeapPositions,
  heapToReactFlow,
  type HeapNode,
} from "@/src/components/visualizer/algorithmsTree/heapTree";

export function useHeapRemoveHandler(params: {
  heapRoot: HeapNode | null;
  setHeapRoot: (root: HeapNode | null) => void;
  isMinHeap: boolean;
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
  const { heapRoot, setHeapRoot, isMinHeap } = params;

  const handleRemove = useCallback(
    (value: number): TreeAnimationStep[] => {
      const stepToLine = [1, 2, 3, 4, 5, 6, 8];
      const treeAction = "heap-remove";
      const steps: TreeAnimationStep[] = [];

      if (!heapRoot) {
        steps.push({
          nodes: [],
          edges: [],
          description: "The heap is empty. There is nothing to remove.",
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
        description: `Starting removal of ${value} from heap.`,
        codeStep: 0,
        treeAction,
        stepToCodeLine: stepToLine,
      });

      // Steps: Search phase
      path.forEach((id, idx) => {
        const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === id,
            highlightColor: n.id === id ? "#62A2F7" : undefined,
          },
        }));
        const edgePath = path
          .slice(0, idx)
          .map((src, i) => `heap-edge-${src}-${path[i + 1]}`);
        const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => ({
          ...e,
          style: edgePath.includes(e.id)
            ? { stroke: "#F7AD45", strokeWidth: 3 }
            : { stroke: "#999", strokeWidth: 2 },
        }));
        steps.push({
          nodes: highlighted,
          edges: highlightedEdges,
          description: `Searching for ${value}. Visiting node in level order.`,
          codeStep: 1,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      });

      if (!found) {
        steps.push({
          nodes: rfNodes as RFNode[],
          edges: rfEdges as RFEdge[],
          description: `Value ${value} was not found in the heap.`,
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
        return steps;
      }

      // Step: Highlight target node (red)
      {
        const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? "#EF4444" : undefined,
          },
        }));
        steps.push({
          nodes: highlighted,
          edges: rfEdges as RFEdge[],
          description: `Found ${value}. Locate the deepest rightmost node to replace it.`,
          codeStep: 2,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Pre-compute removal
      const rootCopy = cloneHeap(heapRoot);
      const {
        root: newRoot,
        siftPath,
        lastNodeId,
        removedId,
      } = removeHeap(rootCopy, value, isMinHeap);

      if (!lastNodeId || !removedId) {
        // Only one node — empty after removal
        steps.push({
          nodes: [],
          edges: [],
          description: `Removed ${value}. The heap is now empty.`,
          codeStep: 6,
          treeAction,
          stepToCodeLine: stepToLine,
        });
        steps.push({
          nodes: [],
          edges: [],
          description: "",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
        setHeapRoot(null);
        return steps;
      }

      // Step: Highlight last node (yellow)
      {
        const extNodes = (rfNodes as RFNode[]).map((n) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === removedId || n.id === lastNodeId,
            highlightColor:
              n.id === removedId
                ? "#EF4444"
                : n.id === lastNodeId
                  ? "#F7AD45"
                  : undefined,
          },
        }));
        const foundNode = (rfNodes as RFNode[]).find(
          (n) => n.id === lastNodeId,
        );
        const labelStr = foundNode
          ? String((foundNode.data as Record<string, unknown>).label)
          : "";
        steps.push({
          nodes: extNodes,
          edges: rfEdges as RFEdge[],
          description: `Deepest rightmost node is ${labelStr}. Move it to the removed node position.`,
          codeStep: 2,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Build simulation tree after replacement (before sift)
      const simTree = cloneHeap(heapRoot);
      const simQueue = [simTree];
      let simTarget: HeapNode | null = null;
      let simLast: HeapNode | null = null;
      let simLastParent: HeapNode | null = null;

      while (simQueue.length > 0) {
        const cur = simQueue.shift()!;
        if (cur.id === removedId) simTarget = cur;
        if (cur.id === lastNodeId) simLast = cur;
        if (cur.left && cur.left.id === lastNodeId) simLastParent = cur;
        if (cur.right && cur.right.id === lastNodeId) simLastParent = cur;
        if (cur.left) simQueue.push(cur.left);
        if (cur.right) simQueue.push(cur.right);
      }

      if (simTarget && simLast) {
        simTarget.id = simLast.id;
        simTarget.value = simLast.value;
        if (simLastParent) {
          if (simLastParent.left?.id === simLast.id) simLastParent.left = null;
          else if (simLastParent.right?.id === simLast.id)
            simLastParent.right = null;
        }
      }

      // Step: Show replaced state
      {
        const simPos = calculateHeapPositions(simTree);
        const { nodes: sn, edges: se } = heapToReactFlow(
          simTree,
          [],
          [],
          simPos,
          "heap-edge",
        );
        const snHigh = (sn as RFNode[]).map((n) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === lastNodeId,
            highlightColor: n.id === lastNodeId ? "#F7AD45" : undefined,
          },
        }));
        steps.push({
          nodes: snHigh,
          edges: se as RFEdge[],
          description: `Replacement complete. Check heap property and apply sift operations if needed.`,
          codeStep: 3,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Steps: Sift swaps
      let currentSiftNodeId = lastNodeId;
      siftPath.forEach((swapId, siftIdx) => {
        const siftingId = currentSiftNodeId;
        const partnerId = swapId;

        // Pre-swap highlight
        {
          const simPos = calculateHeapPositions(simTree);
          const { nodes: sn, edges: se } = heapToReactFlow(
            simTree,
            [],
            [],
            simPos,
            "heap-edge",
          );
          const snHigh = (sn as RFNode[]).map((n) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === siftingId || n.id === partnerId,
              highlightColor:
                n.id === siftingId || n.id === partnerId
                  ? "#F7AD45"
                  : undefined,
            },
          }));
          steps.push({
            nodes: snHigh,
            edges: se as RFEdge[],
            description: `Sift step ${siftIdx + 1} of ${siftPath.length}: swap with node ${swapId}.`,
            codeStep: 4,
            treeAction,
            stepToCodeLine: stepToLine,
          });
        }

        // Perform swap in sim tree
        const sq = [simTree];
        let nodeA: HeapNode | null = null;
        let nodeB: HeapNode | null = null;
        while (sq.length > 0) {
          const c = sq.shift()!;
          if (c.id === siftingId) nodeA = c;
          if (c.id === partnerId) nodeB = c;
          if (c.left) sq.push(c.left);
          if (c.right) sq.push(c.right);
        }
        if (nodeA && nodeB) {
          const tmpV = nodeA.value;
          const tmpI = nodeA.id;
          nodeA.value = nodeB.value;
          nodeA.id = nodeB.id;
          nodeB.value = tmpV;
          nodeB.id = tmpI;
        }

        // Post-swap state
        {
          const simPos = calculateHeapPositions(simTree);
          const { nodes: sn, edges: se } = heapToReactFlow(
            simTree,
            [],
            [],
            simPos,
            "heap-edge",
          );
          const snHigh = (sn as RFNode[]).map((n) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === siftingId || n.id === partnerId,
              highlightColor:
                n.id === siftingId || n.id === partnerId
                  ? "#F7AD45"
                  : undefined,
            },
          }));
          steps.push({
            nodes: snHigh,
            edges: se as RFEdge[],
            description: `Swap complete. Continue sifting if needed.`,
            codeStep: 5,
            treeAction,
            stepToCodeLine: stepToLine,
          });
        }

        currentSiftNodeId = partnerId;
      });

      // Final state
      if (newRoot) {
        const newPositions = calculateHeapPositions(newRoot);
        const { nodes: newRFNodes, edges: newRFEdges } = heapToReactFlow(
          newRoot,
          [],
          [],
          newPositions,
          "heap-edge",
        );
        steps.push({
          nodes: newRFNodes as RFNode[],
          edges: newRFEdges as RFEdge[],
          description: `Removal complete. Heap property is restored.`,
          codeStep: 6,
          treeAction,
          stepToCodeLine: stepToLine,
        });
        steps.push({
          nodes: newRFNodes as RFNode[],
          edges: newRFEdges as RFEdge[],
          description: "",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
      } else {
        steps.push({
          nodes: [],
          edges: [],
          description: `Removed ${value}. The heap is now empty.`,
          codeStep: 6,
          treeAction,
          stepToCodeLine: stepToLine,
        });
        steps.push({
          nodes: [],
          edges: [],
          description: "",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
      }

      setHeapRoot(newRoot);
      return steps;
    },
    [heapRoot, setHeapRoot, isMinHeap],
  );

  return { handleRemove };
}
