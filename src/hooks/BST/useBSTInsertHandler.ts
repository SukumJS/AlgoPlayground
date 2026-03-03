import { useCallback, useRef } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import {
  insertBST,
  searchBST,
  calculateBSTPositions,
  bstToReactFlow,
  cloneBSTTree,
  type BSTNode,
} from "@/src/components/visualizer/algorithmsTree/bstTree";

interface UseBSTInsertHandlerProps {
  bstRoot: BSTNode | null;
  setBSTRoot: (root: BSTNode | null) => void;
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
}

export function useBSTInsertHandler({
  bstRoot,
  setBSTRoot,
  setNodes,
  setEdges,
  setDescription,
  animationSpeed,
  isPausedRef,
}: UseBSTInsertHandlerProps) {
  const counterRef = useRef(0);

  const handleInsert = useCallback(
    (value: number) => {
      const controller = new AnimationController(isPausedRef);

      // Duplicate check
      const { found, path } = searchBST(bstRoot, value);
      if (found) {
        setDescription(`Value ${value} already exists!`);
        controller.scheduleStep(() => setDescription(""), animationSpeed * 2); // Keep for 2 seconds
        return;
      }

      const newNodeId = `bst-node-${Date.now()}_${counterRef.current++}`;

      // Pre-compute final tree
      const rootCopy = cloneBSTTree(bstRoot);
      const newRoot = insertBST(rootCopy, value, newNodeId);

      // Build ReactFlow for old tree (traversal animation)
      const oldPositions = calculateBSTPositions(bstRoot);
      const oldRF = bstRoot
        ? bstToReactFlow(bstRoot, [], [], oldPositions)
        : { nodes: [], edges: [] };

      // Build ReactFlow for new tree (post-insert)
      const newPositions = calculateBSTPositions(newRoot);
      const newRF = bstToReactFlow(newRoot, [], [], newPositions);

      let globalOffset = 0;

      // Step 1: Animate traversal path on OLD tree
      if (path.length > 0) {
        path.forEach((nodeId, idx) => {
          controller.scheduleStep(
            () => {
              // Description step
              const highlighted = (oldRF.nodes as RFNode[]).map(
                (n: RFNode) => ({
                  ...n,
                  data: {
                    ...n.data,
                    isHighlighted: n.id === nodeId,
                    highlightColor: n.id === nodeId ? "#62A2F7" : undefined,
                  },
                }),
              );
              const highlightedEdges = (oldRF.edges as RFEdge[]).map(
                (e: RFEdge) => {
                  const visitedIds = new Set(path.slice(0, idx + 1));
                  const isEdgeHighlighted =
                    visitedIds.has(e.source) && visitedIds.has(e.target);
                  return {
                    ...e,
                    style: isEdgeHighlighted
                      ? { stroke: "#F7AD45", strokeWidth: 3 }
                      : { stroke: "#999", strokeWidth: 2 },
                  };
                },
              );
              setNodes(highlighted);
              setEdges(highlightedEdges);
              const currentNode = (oldRF.nodes as RFNode[]).find(
                (n) => n.id === nodeId,
              ); // Find current node for description
              setDescription(
                `Finding insertion spot for ${value}. Comparing with node ${currentNode?.data.label}.`,
              );
            },
            animationSpeed * (idx * 2 + 1),
          );

          controller.scheduleStep(
            () => {
              // Pause step
              // Keep description visible for a short duration
              // No visual change, just a pause
            },
            animationSpeed * (idx * 2 + 2),
          );
        });
        globalOffset = path.length * 2;
      }

      // Step 2: Show new tree with inserted node highlighted (green)
      globalOffset++;
      controller.scheduleStep(() => {
        const highlighted = (newRF.nodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === newNodeId,
            highlightColor: n.id === newNodeId ? "#4CAF7D" : undefined,
          },
        }));
        setNodes(highlighted);
        setEdges(newRF.edges as RFEdge[]);
        setDescription(`Inserted ${value}!`);
      }, animationSpeed * globalOffset);

      // Step 3: Final clean state
      globalOffset++;
      controller.scheduleStep(() => {
        setBSTRoot(newRoot);
        setNodes(newRF.nodes as RFNode[]);
        setEdges(newRF.edges as RFEdge[]);
        setDescription("");
      }, animationSpeed * globalOffset);
    },
    [
      bstRoot,
      setBSTRoot,
      animationSpeed,
      isPausedRef,
      setNodes,
      setEdges,
      setDescription,
    ],
  );

  const cancelAnimation = useCallback(() => {}, []);

  return { handleInsert, cancelAnimation };
}
