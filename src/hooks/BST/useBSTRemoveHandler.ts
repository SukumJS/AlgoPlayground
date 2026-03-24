import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import {
  removeBST,
  searchBST,
  calculateBSTPositions,
  bstToReactFlow,
  cloneBSTTree,
  findBSTSuccessor,
  type BSTNode,
} from "@/src/components/visualizer/algorithmsTree/bstTree";

interface UseBSTRemoveHandlerProps {
  bstRoot: BSTNode | null;
  setBSTRoot: (root: BSTNode | null) => void;
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

export function useBSTRemoveHandler({
  bstRoot,
  setBSTRoot,
}: UseBSTRemoveHandlerProps) {
  const bstRootRef = useRef<BSTNode | null>(bstRoot);
  useEffect(() => {
    bstRootRef.current = bstRoot;
  }, [bstRoot]);

  const handleRemove = useCallback(
    (value: number): TreeAnimationStep[] => {
      const codeMap = [1, 3, 13, 10, 16, 14, 20];
      const root = bstRootRef.current;
      const treeAction = "bst-remove";
      const steps: TreeAnimationStep[] = [];

      if (!root) {
        steps.push({
          nodes: [],
          edges: [],
          description: "The tree is empty. There is nothing to remove.",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: codeMap,
        });
        return steps;
      }

      const { found, nodeId, path } = searchBST(root, value);
      const { successorId } = findBSTSuccessor(root, value);
      const positions = calculateBSTPositions(root);
      const rfData = bstToReactFlow(root, [], [], positions);
      const rfNodes = rfData.nodes as RFNode[];
      const rfEdges = rfData.edges as RFEdge[];

      // Step 0: Initial state
      steps.push({
        nodes: rfNodes,
        edges: rfEdges,
        description: `Starting removal of ${value}. Will search BST path.`,
        codeStep: 0,
        treeAction,
        stepToCodeLine: codeMap,
      });

      // Steps: Animate search traversal
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
          description: `Searching for ${value} to remove. Compare with node ${currentNode?.data.label} and continue down the BST path.`,
          codeStep: 1,
          treeAction,
          stepToCodeLine: codeMap,
        });
      });

      // Not found
      if (!found) {
        steps.push({
          nodes: rfNodes,
          edges: rfEdges,
          description: `Value ${value} was not found, so no node is removed.`,
          codeStep: 3,
          treeAction: null,
          stepToCodeLine: codeMap,
        });
        return steps;
      }

      // Step: Highlight found node in red
      {
        const highlighted = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? "#EF4444" : undefined,
          },
        }));
        steps.push({
          nodes: highlighted,
          edges: rfEdges,
          description: `Found ${value}. Prepare to remove this node and reconnect the tree.`,
          codeStep: 2,
          treeAction,
          stepToCodeLine: codeMap,
        });
      }

      // Step: Highlight inorder successor if exists
      if (successorId) {
        const highlighted = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId || n.id === successorId,
            highlightColor:
              n.id === nodeId
                ? "#EF4444"
                : n.id === successorId
                  ? "#F7AD45"
                  : undefined,
          },
        }));
        steps.push({
          nodes: highlighted,
          edges: rfEdges,
          description: `This node has two children. Find the inorder successor to replace it safely.`,
          codeStep: 4,
          treeAction,
          stepToCodeLine: codeMap,
        });
      }

      // Perform removal
      const rootCopy = cloneBSTTree(root);
      const newRoot = removeBST(rootCopy, value);

      if (newRoot) {
        const finalPositions = calculateBSTPositions(newRoot);
        const finalRF = bstToReactFlow(newRoot, [], [], finalPositions);

        // Step: Topology re-wire (nodes in old positions but new edges)
        const beforePosMap = new Map<string, { x: number; y: number }>();
        rfNodes.forEach((n) => {
          beforePosMap.set(n.id, { x: n.position.x, y: n.position.y });
        });

        const tangledNodes = (finalRF.nodes as RFNode[]).map((n: RFNode) => {
          const beforePosId =
            n.id === nodeId && successorId ? successorId : n.id;
          const before = beforePosMap.get(beforePosId) || n.position;
          return {
            ...n,
            position: before,
            data: {
              ...n.data,
              isHighlighted: n.id === nodeId,
              highlightColor: n.id === nodeId ? "#F7AD45" : undefined,
            },
          };
        });

        const hlEdges = (finalRF.edges as RFEdge[]).map((e: RFEdge) => ({
          ...e,
          style:
            e.source === nodeId || e.target === nodeId
              ? { stroke: "#F7AD45", strokeWidth: 3 }
              : { stroke: "#999", strokeWidth: 2 },
        }));

        steps.push({
          nodes: tangledNodes,
          edges: hlEdges,
          description:
            "Update parent and child links to remove the target node.",
          codeStep: 5,
          treeAction,
          stepToCodeLine: codeMap,
        });

        // Step: Final position (green highlight on replacement)
        const finalNodes = (finalRF.nodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? "#4CAF7D" : undefined,
          },
        }));
        steps.push({
          nodes: finalNodes,
          edges: finalRF.edges as RFEdge[],
          description: `Removed ${value}. BST structure is updated.`,
          codeStep: 5,
          treeAction,
          stepToCodeLine: codeMap,
        });

        // Clean step
        steps.push({
          nodes: finalRF.nodes as RFNode[],
          edges: finalRF.edges as RFEdge[],
          description: "",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: codeMap,
        });

        setBSTRoot(newRoot);
      } else {
        // Tree is empty
        steps.push({
          nodes: [],
          edges: [],
          description: `Removed ${value}. The tree is now empty.`,
          codeStep: 5,
          treeAction,
          stepToCodeLine: codeMap,
        });
        steps.push({
          nodes: [],
          edges: [],
          description: "",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: codeMap,
        });
        setBSTRoot(null);
      }

      return steps;
    },
    [setBSTRoot],
  );

  const cancelAnimation = useCallback(() => {}, []);

  return { handleRemove, cancelAnimation };
}
