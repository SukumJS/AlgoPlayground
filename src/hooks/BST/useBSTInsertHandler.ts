import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
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
  setCodeStep?: AnimationCallbacks["setCodeStep"];
  setStepToCodeLine?: AnimationCallbacks["setStepToCodeLine"];
  setTreeAction?: AnimationCallbacks["setTreeAction"];
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
}

export function useBSTInsertHandler({
  bstRoot,
  setBSTRoot,
}: UseBSTInsertHandlerProps) {
  const counterRef = useRef(0);
  const bstRootRef = useRef<BSTNode | null>(bstRoot);
  useEffect(() => {
    bstRootRef.current = bstRoot;
  }, [bstRoot]);

  const handleInsert = useCallback(
    (value: number): TreeAnimationStep[] => {
      const codeMap = [1, 3, 4, 5, 12, 13];
      const root = bstRootRef.current;
      const treeAction = "bst-insert";
      const steps: TreeAnimationStep[] = [];

      // Duplicate check
      const { found, path } = searchBST(root, value);
      if (found) {
        const positions = calculateBSTPositions(root);
        const rfData = root
          ? bstToReactFlow(root, [], [], positions)
          : { nodes: [], edges: [] };
        steps.push({
          nodes: rfData.nodes as RFNode[],
          edges: rfData.edges as RFEdge[],
          description: `Value ${value} already exists. BST does not insert duplicates.`,
          codeStep: 0,
          treeAction,
          stepToCodeLine: codeMap,
        });
        return steps;
      }

      const newNodeId = `bst-node-${Date.now()}_${counterRef.current++}`;

      // Pre-compute final tree
      const rootCopy = cloneBSTTree(root);
      const newRoot = insertBST(rootCopy, value, newNodeId);

      // Build ReactFlow for old tree
      const oldPositions = calculateBSTPositions(root);
      const oldRF = root
        ? bstToReactFlow(root, [], [], oldPositions)
        : { nodes: [], edges: [] };

      // Build ReactFlow for new tree
      const newPositions = calculateBSTPositions(newRoot);
      const newRF = bstToReactFlow(newRoot, [], [], newPositions);

      // Step 0: Initial state
      steps.push({
        nodes: oldRF.nodes as RFNode[],
        edges: oldRF.edges as RFEdge[],
        description: `Starting insertion of ${value}. Will traverse BST to find correct position.`,
        codeStep: 0,
        treeAction,
        stepToCodeLine: codeMap,
      });

      // Steps: Animate traversal path on OLD tree
      path.forEach((nodeId, idx) => {
        const highlighted = (oldRF.nodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? "#62A2F7" : undefined,
          },
        }));
        const highlightedEdges = (oldRF.edges as RFEdge[]).map((e: RFEdge) => {
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
        const currentNode = (oldRF.nodes as RFNode[]).find(
          (n) => n.id === nodeId,
        );
        steps.push({
          nodes: highlighted,
          edges: highlightedEdges,
          description: `Finding where to insert ${value}. Compare with node ${currentNode?.data.label} and move left or right.`,
          codeStep: 3,
          treeAction,
          stepToCodeLine: codeMap,
        });
      });

      // Step: Show new tree with inserted node highlighted (green)
      const highlighted = (newRF.nodes as RFNode[]).map((n: RFNode) => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted: n.id === newNodeId,
          highlightColor: n.id === newNodeId ? "#4CAF7D" : undefined,
        },
      }));
      steps.push({
        nodes: highlighted,
        edges: newRF.edges as RFEdge[],
        description: `Inserted ${value} and updated links to keep BST order.`,
        codeStep: 4,
        treeAction,
        stepToCodeLine: codeMap,
      });

      // Final clean step
      steps.push({
        nodes: newRF.nodes as RFNode[],
        edges: newRF.edges as RFEdge[],
        description: "",
        codeStep: 0,
        treeAction: null,
        stepToCodeLine: codeMap,
      });

      // Perform actual tree mutation
      setBSTRoot(newRoot);

      return steps;
    },
    [setBSTRoot],
  );

  const cancelAnimation = useCallback(() => {}, []);

  return { handleInsert, cancelAnimation };
}
