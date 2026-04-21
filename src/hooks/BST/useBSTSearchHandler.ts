import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import {
  searchBST,
  calculateBSTPositions,
  bstToReactFlow,
  type BSTNode,
} from "@/src/components/visualizer/algorithmsTree/bstTree";

interface UseBSTSearchHandlerProps {
  bstRoot: BSTNode | null;
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  setCodeStep?: AnimationCallbacks["setCodeStep"];
  setStepToCodeLine?: AnimationCallbacks["setStepToCodeLine"];
  setTreeAction?: AnimationCallbacks["setTreeAction"];
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
}

export function useBSTSearchHandler({ bstRoot }: UseBSTSearchHandlerProps) {
  const bstRootRef = useRef<BSTNode | null>(bstRoot);
  useEffect(() => {
    bstRootRef.current = bstRoot;
  }, [bstRoot]);

  const handleSearch = useCallback((value: number): TreeAnimationStep[] => {
    const codeMap = [1, 3, 4, 6, 5, 12, 13];
    const root = bstRootRef.current;
    const treeAction = "bst-search";
    const steps: TreeAnimationStep[] = [];

    if (!root) {
      steps.push({
        nodes: [],
        edges: [],
        description: "The tree is empty. Insert a node first.",
        codeStep: 0,
        treeAction: null,
        stepToCodeLine: codeMap,
      });
      return steps;
    }

    const { found, nodeId, path } = searchBST(root, value);
    const positions = calculateBSTPositions(root);
    const rfData = bstToReactFlow(root, [], [], positions);
    const rfNodes = rfData.nodes as RFNode[];
    const rfEdges = rfData.edges as RFEdge[];

    // Step 0: Initial state
    steps.push({
      nodes: rfNodes,
      edges: rfEdges,
      description: `Starting search for ${value}. Will compare and traverse BST path.`,
      codeStep: 0,
      treeAction,
      stepToCodeLine: codeMap,
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
      const highlightedEdges = rfEdges.map((e: RFEdge) => {
        const visitedIds = new Set(path.slice(0, idx + 1));
        const isEdgeHighlighted =
          visitedIds.has(e.source) && visitedIds.has(e.target);
        return {
          ...e,
          style: isEdgeHighlighted
            ? { stroke: "#F7AD45", strokeWidth: 3 }
            : { stroke: "#999", strokeWidth: 2 },
        };
      });
      const currentNode = rfNodes.find((n) => n.id === id);
      steps.push({
        nodes: highlighted,
        edges: highlightedEdges,
        description: `Searching for ${value}. Compare with node ${currentNode?.data.label} and choose left or right branch.`,
        codeStep: 3,
        treeAction,
        stepToCodeLine: codeMap,
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
        codeStep: 4,
        treeAction,
        stepToCodeLine: codeMap,
      });
    } else {
      steps.push({
        nodes: rfNodes,
        edges: rfEdges,
        description: `Value ${value} was not found after reaching the end of the search path.`,
        codeStep: 5,
        treeAction,
        stepToCodeLine: codeMap,
      });
    }

    // Final clean step
    steps.push({
      nodes: rfNodes,
      edges: rfEdges,
      description: "",
      codeStep: 0,
      treeAction: null,
      stepToCodeLine: codeMap,
    });

    return steps;
  }, []);

  const cancelAnimation = useCallback(() => {}, []);

  return { handleSearch, cancelAnimation };
}
