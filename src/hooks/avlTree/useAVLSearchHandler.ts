import { useCallback, MutableRefObject } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import {
  searchAVL,
  calculateTreePositions,
  avlTreeToReactFlow,
  type AVLTreeNode,
} from "@/src/components/visualizer/algorithmsTree/avlTree";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";

/**
 * Hook: AVL Search Handler
 * - Node highlight: current node ONLY (not persisted)
 * - Edge highlight: accumulated path (persisted), color #F7AD45
 */
export function useAVLSearchHandler(params: {
  avlRoot: AVLTreeNode | null;
  animationSpeed: number;
  rf: ReturnType<typeof useReactFlow>;
  animationCallbacks: AnimationCallbacks;
  isPausedRef: MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
  setSearchValue: (v: string) => void;
}) {
  const {
    avlRoot,
    animationSpeed,
    animationCallbacks,
    isPausedRef,
    setIsAnimating,
    setSearchValue,
  } = params;

  const handleAVLSearch = useCallback(
    (value: number) => {
      const controller = new AnimationController(isPausedRef);
      setIsAnimating(true);

      // Pseudo code drive: CodeAVLTreeView (avl-search)
      // 1 ALGORITHM
      // 3 WHILE...
      // 4 IF value == node.value THEN
      // 5 RETURN FOUND
      // 12 RETURN NOT_FOUND
      // 13 END ALGORITHM
      const stepToLine = [1, 3, 4, 5, 12, 13];
      animationCallbacks.setTreeAction?.("avl-search");
      animationCallbacks.setStepToCodeLine?.(stepToLine);
      animationCallbacks.setCodeStep?.(0);

      if (!avlRoot) {
        animationCallbacks.setDescription(
          "The tree is empty. Insert a node first.",
        );
        animationCallbacks.setCodeStep?.(0);
        animationCallbacks.setTreeAction?.(null);
        setIsAnimating(false);
        controller.scheduleStep(
          () => animationCallbacks.setDescription(""),
          animationSpeed * 2,
        ); // Keep for 2 seconds
        return;
      }

      const { found, nodeId, path } = searchAVL(avlRoot, value);
      const positions = calculateTreePositions(avlRoot);
      const rfData = avlTreeToReactFlow(avlRoot, [], [], positions);
      const rfNodes = rfData.nodes as RFNode[];
      const rfEdges = rfData.edges as RFEdge[];

      // Step 1: Animate traversal — only current node highlighted, edges accumulated
      path.forEach((id, idx) => {
        controller.scheduleStep(
          () => {
            // Node: highlight ONLY current node
            const highlighted = rfNodes.map((n: RFNode) => ({
              ...n,
              data: {
                ...n.data,
                isHighlighted: n.id === id,
                highlightColor: n.id === id ? "#62A2F7" : undefined,
              },
            }));
            // Edges: accumulate highlighted path
            const visitedIds = new Set(path.slice(0, idx + 1));
            const highlightedEdges = rfEdges.map((e: RFEdge) => ({
              ...e,
              style:
                visitedIds.has(e.source) && visitedIds.has(e.target)
                  ? { stroke: "#F7AD45", strokeWidth: 3 }
                  : { stroke: "#999", strokeWidth: 2 },
            }));
            animationCallbacks.setNodes(highlighted);
            animationCallbacks.setEdges(highlightedEdges);
            const currentNode = rfNodes.find((n) => n.id === id);
            animationCallbacks.setDescription(
              `Searching for ${value}. Compare with node ${currentNode?.data.label} and follow the AVL search path.`,
            );
            animationCallbacks.setCodeStep?.(1);
          },
          animationSpeed * (idx + 1),
        );
      });

      // Step 2: Show result
      controller.scheduleStep(
        () => {
          if (found && nodeId) {
            const highlighted = rfNodes.map((n: RFNode) => ({
              ...n,
              data: {
                ...n.data,
                isHighlighted: n.id === nodeId,
                highlightColor: n.id === nodeId ? "#4CAF7D" : undefined,
              },
            }));
            animationCallbacks.setNodes(highlighted);
            animationCallbacks.setDescription(
              `Value ${value} found. This is the target node.`,
            );
            animationCallbacks.setCodeStep?.(3);
          } else {
            animationCallbacks.setNodes(rfNodes);
            animationCallbacks.setDescription(
              `Value ${value} was not found in the AVL tree.`,
            );
            animationCallbacks.setCodeStep?.(4);
          }
          animationCallbacks.setEdges(rfEdges);

          // Step 3: Clean up
          controller.scheduleStep(() => {
            animationCallbacks.setNodes(rfNodes);
            animationCallbacks.setEdges(rfEdges);
            animationCallbacks.setDescription("");
            animationCallbacks.setCodeStep?.(0);
            animationCallbacks.setTreeAction?.(null);
            setIsAnimating(false);
            setSearchValue("");
          }, animationSpeed * 4); // Longer delay for final state
        },
        animationSpeed * (path.length + 1),
      );
    },
    [
      avlRoot,
      animationSpeed,
      animationCallbacks,
      isPausedRef,
      setIsAnimating,
      setSearchValue,
    ],
  );

  return handleAVLSearch;
}
