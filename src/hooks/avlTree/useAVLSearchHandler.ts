import { useCallback } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import {
  searchAVL,
  calculateTreePositions,
  avlTreeToReactFlow,
  type AVLTreeNode,
} from "@/src/components/visualizer/algorithmsTree/avlTree";

export function useAVLSearchHandler(params: {
  avlRoot: AVLTreeNode | null;
  animationSpeed: number;
  rf: ReturnType<typeof useReactFlow>;
  animationCallbacks: AnimationCallbacks;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
  setSearchValue: (v: string) => void;
}) {
  const { avlRoot } = params;

  const handleAVLSearch = useCallback(
    (value: number): TreeAnimationStep[] => {
      const stepToLine = [1, 3, 4, 5, 12, 13];
      const treeAction = "avl-search";
      const steps: TreeAnimationStep[] = [];

      if (!avlRoot) {
        steps.push({
          nodes: [],
          edges: [],
          description: "The tree is empty. Insert a node first.",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
        return steps;
      }

      const { found, nodeId, path } = searchAVL(avlRoot, value);
      const positions = calculateTreePositions(avlRoot);
      const rfData = avlTreeToReactFlow(avlRoot, [], [], positions);
      const rfNodes = rfData.nodes as RFNode[];
      const rfEdges = rfData.edges as RFEdge[];

      // Step 0: Initial state
      steps.push({
        nodes: rfNodes,
        edges: rfEdges,
        description: `Starting search for ${value} in AVL tree.`,
        codeStep: 0,
        treeAction,
        stepToCodeLine: stepToLine,
      });

      // Steps: Animate traversal
      path.forEach((id, idx) => {
        const highlighted = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === id,
            highlightColor: n.id === id ? "#62A2F7" : undefined,
          },
        }));
        const visitedIds = new Set(path.slice(0, idx + 1));
        const highlightedEdges = rfEdges.map((e: RFEdge) => ({
          ...e,
          style:
            visitedIds.has(e.source) && visitedIds.has(e.target)
              ? { stroke: "#F7AD45", strokeWidth: 3 }
              : { stroke: "#999", strokeWidth: 2 },
        }));
        const currentNode = rfNodes.find((n) => n.id === id);
        steps.push({
          nodes: highlighted,
          edges: highlightedEdges,
          description: `Searching for ${value}. Compare with node ${currentNode?.data.label} and follow the AVL search path.`,
          codeStep: 1,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      });

      // Result step
      if (found && nodeId) {
        const highlighted = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? "#4CAF7D" : undefined,
          },
        }));
        steps.push({
          nodes: highlighted,
          edges: rfEdges,
          description: `Value ${value} found. This is the target node.`,
          codeStep: 3,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      } else {
        steps.push({
          nodes: rfNodes,
          edges: rfEdges,
          description: `Value ${value} was not found in the AVL tree.`,
          codeStep: 4,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Final clean step
      steps.push({
        nodes: rfNodes,
        edges: rfEdges,
        description: "",
        codeStep: 0,
        treeAction: null,
        stepToCodeLine: stepToLine,
      });

      return steps;
    },
    [avlRoot],
  );

  return handleAVLSearch;
}
