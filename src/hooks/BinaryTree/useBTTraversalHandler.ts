import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import {
  calculateBTPositions,
  btToReactFlow,
  type BTNode,
} from "@/src/components/visualizer/algorithmsTree/binaryTree";

// Traversal collectors
function collectInorder(node: BTNode | null, result: string[] = []): string[] {
  if (!node) return result;
  collectInorder(node.left, result);
  result.push(node.id);
  collectInorder(node.right, result);
  return result;
}

function collectPreorder(node: BTNode | null, result: string[] = []): string[] {
  if (!node) return result;
  result.push(node.id);
  collectPreorder(node.left, result);
  collectPreorder(node.right, result);
  return result;
}

function collectPostorder(
  node: BTNode | null,
  result: string[] = [],
): string[] {
  if (!node) return result;
  collectPostorder(node.left, result);
  collectPostorder(node.right, result);
  result.push(node.id);
  return result;
}

function getNodeValue(node: BTNode | null, id: string): number | null {
  if (!node) return null;
  if (node.id === id) return node.value;
  return getNodeValue(node.left, id) ?? getNodeValue(node.right, id);
}

interface UseBTTraversalHandlerProps {
  btRoot: BTNode | null;
  nodes: RFNode[];
  edges: RFEdge[];
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  applyHighlighting: AnimationCallbacks["applyHighlighting"];
  setCodeStep?: AnimationCallbacks["setCodeStep"];
  setStepToCodeLine?: AnimationCallbacks["setStepToCodeLine"];
  setTreeAction?: AnimationCallbacks["setTreeAction"];
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (val: boolean) => void;
}

function generateTraversalSteps(
  root: BTNode,
  order: string[],
  label: string,
  treeAction: string,
  currentColor: string,
): TreeAnimationStep[] {
  const positions = calculateBTPositions(root);
  const values = order.map((id) => getNodeValue(root, id) ?? 0);
  const stepToLine = [1, 2, 5, 6, 7, 8];
  const steps: TreeAnimationStep[] = [];

  const traversalCodeSteps: [number, number, number] =
    treeAction === "bt-traversal-preorder"
      ? [3, 2, 4]
      : treeAction === "bt-traversal-postorder"
        ? [2, 4, 3]
        : [2, 3, 4];

  // Step 0: Initial state
  {
    const { nodes, edges } = btToReactFlow(root, [], [], positions);
    steps.push({
      nodes: nodes as RFNode[],
      edges: edges as RFEdge[],
      description: `Start ${label}. Follow the highlighted node order.`,
      codeStep: 1,
      treeAction,
      stepToCodeLine: stepToLine,
    });
  }

  // Steps: Each node with sub-steps for code highlighting
  order.forEach((nodeId, idx) => {
    const visited = new Set(order.slice(0, idx));
    const currentId = order[idx];

    const buildHighlight = () => {
      const { nodes, edges } = btToReactFlow(root, [], [], positions);
      const highlighted = (nodes as RFNode[]).map((n: RFNode) => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted: n.id === nodeId || visited.has(n.id),
          highlightColor:
            n.id === nodeId
              ? currentColor
              : visited.has(n.id)
                ? "#4CAF7D"
                : undefined,
        },
      }));

      const visitedArr = Array.from(visited);
      const highlightedEdges = (edges as RFEdge[]).map((e: RFEdge) => {
        const isHighlightedEdge =
          (visitedArr.includes(e.source) && visitedArr.includes(e.target)) ||
          (visitedArr.includes(e.source) && e.target === currentId);
        return {
          ...e,
          style: isHighlightedEdge
            ? { stroke: "#F7AD45", strokeWidth: 3 }
            : { stroke: "#999", strokeWidth: 2 },
        };
      });

      return { highlighted, highlightedEdges };
    };

    // 3 sub-steps per node for code highlight progression
    traversalCodeSteps.forEach((codeStep, subIdx) => {
      const { highlighted, highlightedEdges } = buildHighlight();
      steps.push({
        nodes: highlighted,
        edges: highlightedEdges,
        description:
          subIdx === 1
            ? `${label}: visit node ${getNodeValue(root, nodeId)} (step ${idx + 1}/${order.length}).`
            : `${label}: continue traversal (step ${idx + 1}/${order.length}).`,
        codeStep,
        treeAction,
        stepToCodeLine: stepToLine,
      });
    });
  });

  // Final step: All visited (green)
  {
    const { nodes, edges } = btToReactFlow(root, [], [], positions);
    const allVisited = new Set(order);
    const finalNodes = (nodes as RFNode[]).map((n: RFNode) => ({
      ...n,
      data: {
        ...n.data,
        isHighlighted: allVisited.has(n.id),
        highlightColor: "#4CAF7D",
      },
    }));
    steps.push({
      nodes: finalNodes,
      edges: edges as RFEdge[],
      description: `${label} complete. Visit order: [${values.join(" -> ")}].`,
      codeStep: 4,
      treeAction,
      stepToCodeLine: stepToLine,
    });
  }

  // Clean step
  {
    const { nodes: clean, edges: cleanE } = btToReactFlow(
      root,
      [],
      [],
      positions,
    );
    steps.push({
      nodes: clean as RFNode[],
      edges: cleanE as RFEdge[],
      description: "",
      codeStep: 0,
      treeAction: null,
      stepToCodeLine: stepToLine,
    });
  }

  return steps;
}

export function useBTTraversalHandler({ btRoot }: UseBTTraversalHandlerProps) {
  const btRootRef = useRef<BTNode | null>(btRoot);
  useEffect(() => {
    btRootRef.current = btRoot;
  }, [btRoot]);

  const handleInorder = useCallback((): TreeAnimationStep[] => {
    const root = btRootRef.current;
    if (!root) {
      return [
        {
          nodes: [],
          edges: [],
          description: "The tree is empty. Traversal cannot start.",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: [],
        },
      ];
    }
    return generateTraversalSteps(
      root,
      collectInorder(root),
      "Inorder (L -> Root -> R)",
      "bt-traversal-inorder",
      "#F7AD45",
    );
  }, []);

  const handlePreorder = useCallback((): TreeAnimationStep[] => {
    const root = btRootRef.current;
    if (!root) {
      return [
        {
          nodes: [],
          edges: [],
          description: "The tree is empty. Traversal cannot start.",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: [],
        },
      ];
    }
    return generateTraversalSteps(
      root,
      collectPreorder(root),
      "Preorder (Root -> L -> R)",
      "bt-traversal-preorder",
      "#F7AD45",
    );
  }, []);

  const handlePostorder = useCallback((): TreeAnimationStep[] => {
    const root = btRootRef.current;
    if (!root) {
      return [
        {
          nodes: [],
          edges: [],
          description: "The tree is empty. Traversal cannot start.",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: [],
        },
      ];
    }
    return generateTraversalSteps(
      root,
      collectPostorder(root),
      "Postorder (L -> R -> Root)",
      "bt-traversal-postorder",
      "#F7AD45",
    );
  }, []);

  const cancelAnimation = useCallback(() => {}, []);

  return { handleInorder, handlePreorder, handlePostorder, cancelAnimation };
}
