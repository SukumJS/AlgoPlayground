import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import {
  insertHeap,
  cloneHeap,
  calculateHeapPositions,
  heapToReactFlow,
  type HeapNode,
} from "@/src/components/visualizer/algorithmsTree/heapTree";

export function useHeapInsertHandler(params: {
  heapRoot: HeapNode | null;
  setHeapRoot: (root: HeapNode | null) => void;
  isMinHeap: boolean;
  nodes: RFNode[];
  edges: RFEdge[];
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
  const counterRef = useRef(0);
  const heapRootRef = useRef<HeapNode | null>(heapRoot);
  useEffect(() => {
    heapRootRef.current = heapRoot;
  }, [heapRoot]);

  const handleInsert = useCallback(
    (value: number): TreeAnimationStep[] => {
      const stepToLine = [1, 2, 4, 5, 6, 7];
      const treeAction = "heap-insert";
      const steps: TreeAnimationStep[] = [];
      const root = heapRootRef.current;

      const nodeId = `heap_${Date.now()}_${counterRef.current++}`;
      const rootCopy = cloneHeap(root);
      const {
        root: newRoot,
        path,
        siftPath,
      } = insertHeap(rootCopy, value, nodeId, isMinHeap);

      // Build simulation tree (state BEFORE sift-up)
      let simTree = cloneHeap(root);
      const newNode: HeapNode = { id: nodeId, value, left: null, right: null };
      if (!simTree) {
        simTree = newNode;
      } else {
        const queue: HeapNode[] = [simTree];
        while (queue.length > 0) {
          const cur = queue.shift()!;
          if (!cur.left) {
            cur.left = newNode;
            break;
          }
          queue.push(cur.left);
          if (!cur.right) {
            cur.right = newNode;
            break;
          }
          queue.push(cur.right);
        }
      }

      // Step 0: Initial state
      if (root) {
        const origPositions = calculateHeapPositions(root);
        const origRF = heapToReactFlow(
          root,
          [],
          [],
          origPositions,
          "heap-edge",
        );
        steps.push({
          nodes: origRF.nodes as RFNode[],
          edges: origRF.edges as RFEdge[],
          description: `Starting insertion of ${value} into heap.`,
          codeStep: 0,
          treeAction,
          stepToCodeLine: stepToLine,
        });

        // Steps: BFS traversal path
        path.forEach((id, idx) => {
          const highlighted = (origRF.nodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === id,
              highlightColor: n.id === id ? "#62A2F7" : undefined,
            },
          }));
          const visitedIds = new Set(path.slice(0, idx + 1));
          const highlightedEdges = (origRF.edges as RFEdge[]).map(
            (e: RFEdge) => ({
              ...e,
              style:
                visitedIds.has(e.source) && visitedIds.has(e.target)
                  ? { stroke: "#F7AD45", strokeWidth: 3 }
                  : { stroke: "#999", strokeWidth: 2 },
            }),
          );
          const visitedNodeValue =
            (origRF.nodes as RFNode[]).find((n) => n.id === id)?.data.label ??
            id;
          steps.push({
            nodes: highlighted,
            edges: highlightedEdges,
            description: `Finding the next empty position in level order. Checking node ${visitedNodeValue}.`,
            codeStep: 1,
            treeAction,
            stepToCodeLine: stepToLine,
          });
        });
      }

      // Step: Show inserted node at bottom (green)
      {
        const positions = calculateHeapPositions(simTree);
        const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(
          simTree,
          [],
          [],
          positions,
          "heap-edge",
        );
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
          description: `Inserted ${value}. ${siftPath.length > 0 ? "Now restore heap order by sifting up." : "Heap property is already satisfied."}`,
          codeStep: 2,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Steps: Sift-up swaps
      let currentSiftNodeId = nodeId;
      siftPath.forEach((swapId, siftIdx) => {
        const siftingId = currentSiftNodeId;
        const parentId = swapId;

        // Pre-swap highlight
        {
          const positions = calculateHeapPositions(simTree);
          const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(
            simTree,
            [],
            [],
            positions,
            "heap-edge",
          );
          const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === siftingId || n.id === parentId,
              highlightColor:
                n.id === siftingId || n.id === parentId ? "#F7AD45" : undefined,
            },
          }));
          steps.push({
            nodes: highlighted,
            edges: rfEdges as RFEdge[],
            description: `Sift up step ${siftIdx + 1} of ${siftPath.length}: swap with parent node.`,
            codeStep: 3,
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
          if (c.id === parentId) nodeB = c;
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
          const positions = calculateHeapPositions(simTree);
          const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(
            simTree,
            [],
            [],
            positions,
            "heap-edge",
          );
          const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === siftingId || n.id === parentId,
              highlightColor:
                n.id === siftingId || n.id === parentId ? "#F7AD45" : undefined,
            },
          }));
          steps.push({
            nodes: highlighted,
            edges: rfEdges as RFEdge[],
            description: `Swap complete. Continue sifting if needed.`,
            codeStep: 4,
            treeAction,
            stepToCodeLine: stepToLine,
          });
        }

        currentSiftNodeId = parentId;
      });

      // Step: Final state (green highlight on settled node)
      {
        const positions = calculateHeapPositions(newRoot);
        const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(
          newRoot,
          [],
          [],
          positions,
          "heap-edge",
        );
        const finalNode = (rfNodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === currentSiftNodeId,
            highlightColor: n.id === currentSiftNodeId ? "#4CAF7D" : undefined,
          },
        }));
        steps.push({
          nodes: finalNode,
          edges: rfEdges as RFEdge[],
          description: `Insertion complete. Heap property is restored for ${value}.`,
          codeStep: 5,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Clean step
      {
        const positions = calculateHeapPositions(newRoot);
        const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(
          newRoot,
          [],
          [],
          positions,
          "heap-edge",
        );
        steps.push({
          nodes: rfNodes as RFNode[],
          edges: rfEdges as RFEdge[],
          description: "",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
      }

      setHeapRoot(newRoot);
      return steps;
    },
    [isMinHeap, setHeapRoot],
  );

  return { handleInsert };
}
