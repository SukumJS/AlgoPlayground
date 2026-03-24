import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import {
  removeBT,
  searchBT,
  calculateBTPositions,
  btToReactFlow,
  cloneBT,
  type BTNode,
} from "@/src/components/visualizer/algorithmsTree/binaryTree";

interface UseBTRemoveHandlerProps {
  btRoot: BTNode | null;
  setBTRoot: (root: BTNode | null) => void;
  nodes: RFNode[];
  edges: RFEdge[];
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  applyHighlighting: (
    nodes: RFNode[],
    edges: RFEdge[],
    highlightedNodeIds: Set<string>,
    highlightedEdgeIds: Set<string>,
    color: string,
    edgeColor?: string,
  ) => { highlightedNodes: RFNode[]; highlightedEdges: RFEdge[] };
  setCodeStep?: (step: number) => void;
  setStepToCodeLine?: (map: number[]) => void;
  setTreeAction?: (action: string | null) => void;
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
}

export function useBTRemoveHandler({
  btRoot,
  setBTRoot,
}: UseBTRemoveHandlerProps) {
  const btRootRef = useRef<BTNode | null>(btRoot);
  useEffect(() => {
    btRootRef.current = btRoot;
  }, [btRoot]);

  const handleRemove = useCallback(
    (value: number): TreeAnimationStep[] => {
      const root = btRootRef.current;
      const stepToLine = [1, 2, 4, 5, 6];
      const treeAction = "bt-remove";
      const steps: TreeAnimationStep[] = [];

      if (!root) {
        steps.push({
          nodes: [],
          edges: [],
          description: "The tree is empty. There is nothing to remove.",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
        return steps;
      }

      const { found, nodeId, path } = searchBT(root, value);
      if (!found) {
        const positions = calculateBTPositions(root);
        const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(
          root,
          [],
          [],
          positions,
        );
        steps.push({
          nodes: rfNodes as RFNode[],
          edges: rfEdges as RFEdge[],
          description: `Value ${value} was not found, so no node is removed.`,
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
        return steps;
      }

      const positions = calculateBTPositions(root);
      const rfData = btToReactFlow(root, [], [], positions);
      const rfNodes = rfData.nodes as RFNode[];
      const rfEdges = rfData.edges as RFEdge[];

      // Step 0: Initial state
      steps.push({
        nodes: rfNodes,
        edges: rfEdges,
        description: `Starting removal of ${value}. Will search in level order.`,
        codeStep: 0,
        treeAction,
        stepToCodeLine: stepToLine,
      });

      // Steps: Traverse search path (Blue highlight)
      path.forEach((id, idx) => {
        const highlightedNodes = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === id,
            highlightColor: n.id === id ? "#62A2F7" : undefined,
          },
        }));

        const visitedNodeIds = new Set(path.slice(0, idx + 1));
        const highlightedEdges = rfEdges.map((e: RFEdge) => ({
          ...e,
          style:
            visitedNodeIds.has(e.source) && visitedNodeIds.has(e.target)
              ? { stroke: "#F7AD45", strokeWidth: 3 }
              : { stroke: "#999", strokeWidth: 2 },
        }));

        const currentNode = rfNodes.find((n) => n.id === id);
        steps.push({
          nodes: highlightedNodes,
          edges: highlightedEdges,
          description: `Searching for ${value} to remove. Visiting node ${currentNode?.data.label} in level order.`,
          codeStep: 1,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      });

      // Step: Highlight node to delete (Red)
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
          description: `Found ${value}. This node will be removed by replacing it with the deepest rightmost node.`,
          codeStep: 2,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Pre-compute removal
      const rootCopy = cloneBT(root);
      const { newRoot, deepestId } = removeBT(rootCopy, value);

      // Step: Highlight replacement node if exists
      if (deepestId && nodeId !== deepestId) {
        const highlighted = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId || n.id === deepestId,
            highlightColor:
              n.id === nodeId
                ? "#EF4444"
                : n.id === deepestId
                  ? "#F7AD45"
                  : undefined,
          },
        }));
        const deepestNode = rfNodes.find((n) => n.id === deepestId);
        steps.push({
          nodes: highlighted,
          edges: rfEdges,
          description: `Use the deepest rightmost node (${deepestNode?.data.label}) to replace the removed value.`,
          codeStep: 2,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Step: Final state after removal
      if (newRoot) {
        const finalPositions = calculateBTPositions(newRoot);
        const finalRF = btToReactFlow(
          newRoot,
          [],
          [],
          finalPositions,
          "bt-edge",
        );

        // Show with green highlight on the replacement node
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
          description: `Removed ${value}. Binary tree structure is updated.`,
          codeStep: 3,
          treeAction,
          stepToCodeLine: stepToLine,
        });

        // Clean step
        steps.push({
          nodes: finalRF.nodes as RFNode[],
          edges: finalRF.edges as RFEdge[],
          description: "",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
      } else {
        // Tree is empty after removal
        steps.push({
          nodes: [],
          edges: [],
          description: `Removed ${value}. The tree is now empty.`,
          codeStep: 3,
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

      // Perform actual tree mutation
      setBTRoot(newRoot);

      return steps;
    },
    [setBTRoot],
  );

  const cancelAnimation = useCallback(() => {}, []);

  return { handleRemove, cancelAnimation };
}
