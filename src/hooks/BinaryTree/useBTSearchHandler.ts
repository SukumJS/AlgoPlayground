import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import {
  searchBT,
  calculateBTPositions,
  btToReactFlow,
  type BTNode,
} from "@/src/components/visualizer/algorithmsTree/binaryTree";

interface UseBTSearchHandlerProps {
  btRoot: BTNode | null;
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

export function useBTSearchHandler({ btRoot }: UseBTSearchHandlerProps) {
  const btRootRef = useRef<BTNode | null>(btRoot);
  useEffect(() => {
    btRootRef.current = btRoot;
  }, [btRoot]);

  const handleSearch = useCallback((value: number): TreeAnimationStep[] => {
    const root = btRootRef.current;
    const stepToLine = [1, 2, 5, 6, 7, 10, 11];
    const treeAction = "bt-search";
    const steps: TreeAnimationStep[] = [];

    if (!root) {
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

    const { found, nodeId, path } = searchBT(root, value);
    const positions = calculateBTPositions(root);

    // Step 0: Initial state
    {
      const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(
        root,
        [],
        [],
        positions,
      );
      steps.push({
        nodes: rfNodes as RFNode[],
        edges: rfEdges as RFEdge[],
        description: `Starting search for ${value}. Will check nodes in level order.`,
        codeStep: 0,
        treeAction,
        stepToCodeLine: stepToLine,
      });
    }

    // Steps: BFS traversal path
    path.forEach((id, idx) => {
      const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(
        root,
        [],
        [],
        positions,
      );

      const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted: n.id === id,
          highlightColor: n.id === id ? "#62A2F7" : undefined,
        },
      }));

      const visitedIds = new Set(path.slice(0, idx + 1));
      const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => ({
        ...e,
        style:
          visitedIds.has(e.source) && visitedIds.has(e.target)
            ? { stroke: "#F7AD45", strokeWidth: 3 }
            : { stroke: "#999", strokeWidth: 2 },
      }));

      const currentNode = (rfNodes as RFNode[]).find((n) => n.id === id);
      steps.push({
        nodes: highlighted,
        edges: highlightedEdges,
        description: `Searching for ${value}. Check node ${currentNode?.data.label} in level order.`,
        codeStep: 3,
        treeAction,
        stepToCodeLine: stepToLine,
      });
    });

    // Result step
    {
      const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(
        root,
        [],
        [],
        positions,
      );
      if (found && nodeId) {
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
          description: `Value ${value} found. This is the matching node.`,
          codeStep: 5,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      } else {
        steps.push({
          nodes: rfNodes as RFNode[],
          edges: rfEdges as RFEdge[],
          description: `Value ${value} was not found after visiting all reachable nodes.`,
          codeStep: 6,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }
    }

    // Final clean step
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
  }, []);

  const cancelAnimation = useCallback(() => {}, []);

  return { handleSearch, cancelAnimation };
}
