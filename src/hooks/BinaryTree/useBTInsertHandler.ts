import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import {
  insertBT,
  calculateBTPositions,
  btToReactFlow,
  type BTNode,
} from "@/src/components/visualizer/algorithmsTree/binaryTree";

interface UseBTInsertHandlerProps {
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

export function useBTInsertHandler({
  btRoot,
  setBTRoot,
}: UseBTInsertHandlerProps) {
  const btRootRef = useRef<BTNode | null>(btRoot);
  useEffect(() => {
    btRootRef.current = btRoot;
  }, [btRoot]);

  /**
   * Generate animation steps for BT Insert and return them.
   * Also performs the actual tree mutation (setBTRoot) at the end.
   */
  const handleInsert = useCallback(
    (value: number): TreeAnimationStep[] => {
      const stepToLine = [1, 2, 6, 7, 8, 12, 15];
      const treeAction = "bt-insert";
      const newNodeId = `bt-node-${Date.now()}`;
      const rootAtInsertTime = btRootRef.current;
      const steps: TreeAnimationStep[] = [];

      // Pre-compute BFS path to find empty slot
      const searchPath: string[] = [];
      const edgePath: string[] = [];
      let parentId: string | null = null;
      let parentDir: "left" | "right" | null = null;

      if (rootAtInsertTime) {
        const queue: BTNode[] = [rootAtInsertTime];
        while (queue.length > 0) {
          const cur = queue.shift()!;
          searchPath.push(cur.id);
          if (!cur.left) {
            parentId = cur.id;
            parentDir = "left";
            break;
          }
          queue.push(cur.left);
          edgePath.push(`bt-edge-${cur.id}-${cur.left.id}`);

          if (!cur.right) {
            parentId = cur.id;
            parentDir = "right";
            break;
          }
          queue.push(cur.right);
          edgePath.push(`bt-edge-${cur.id}-${cur.right.id}`);
        }
      }

      // Step 0: Initial state (before anything happens)
      if (rootAtInsertTime) {
        const positions = calculateBTPositions(rootAtInsertTime);
        const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(
          rootAtInsertTime,
          [],
          [],
          positions,
          "bt-edge",
        );
        steps.push({
          nodes: rfNodes as RFNode[],
          edges: rfEdges as RFEdge[],
          description: `Starting insertion of ${value}. Will search for the next empty position in level order.`,
          codeStep: 0,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Steps: Traverse search path (Blue highlight)
      if (rootAtInsertTime && searchPath.length > 0) {
        searchPath.forEach((id, idx) => {
          const positions = calculateBTPositions(rootAtInsertTime);
          const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(
            rootAtInsertTime,
            [],
            [],
            positions,
            "bt-edge",
          );

          const highlightedNodes = (rfNodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === id,
              highlightColor: n.id === id ? "#62A2F7" : undefined,
            },
          }));

          const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => {
            const isHighlightedEdge = edgePath.slice(0, idx).includes(e.id);
            return {
              ...e,
              style: isHighlightedEdge
                ? { stroke: "#F7AD45", strokeWidth: 3 }
                : { stroke: "#999", strokeWidth: 2 },
            };
          });

          const currentNode = (rfNodes as RFNode[]).find((n) => n.id === id);
          steps.push({
            nodes: highlightedNodes,
            edges: highlightedEdges,
            description: `Finding the next empty position in level order. Checking node ${currentNode?.data.label}.`,
            codeStep: 3,
            treeAction,
            stepToCodeLine: stepToLine,
          });
        });
      }

      // Step: Highlight Parent (Yellow)
      if (parentId && rootAtInsertTime) {
        const positions = calculateBTPositions(rootAtInsertTime);
        const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(
          rootAtInsertTime,
          [],
          [],
          positions,
          "bt-edge",
        );

        const highlightedNodes = (rfNodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === parentId,
            highlightColor: n.id === parentId ? "#F7AD45" : undefined,
          },
        }));

        const parentNode = (rfNodes as RFNode[]).find((n) => n.id === parentId);
        steps.push({
          nodes: highlightedNodes,
          edges: rfEdges as RFEdge[],
          description: `Found an empty ${parentDir} child slot under node ${parentNode?.data.label}.`,
          codeStep: 4,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Step: Insert & show green highlight
      const newRoot = insertBT(rootAtInsertTime, value, newNodeId);
      const positions = calculateBTPositions(newRoot);
      const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(
        newRoot,
        [],
        [],
        positions,
        "bt-edge",
      );

      const highlightedNodes = (rfNodes as RFNode[]).map((n: RFNode) => ({
        ...n,
        data: {
          ...n.data,
          isHighlighted: n.id === newNodeId,
          highlightColor: n.id === newNodeId ? "#4CAF7D" : undefined,
        },
      }));

      steps.push({
        nodes: highlightedNodes,
        edges: rfEdges as RFEdge[],
        description: `Inserted ${value} into the next available position and updated links.`,
        codeStep: 5,
        treeAction,
        stepToCodeLine: stepToLine,
      });

      // Final step: Clear highlights
      const finalPositions = calculateBTPositions(newRoot);
      const { nodes: finalNodes, edges: finalEdges } = btToReactFlow(
        newRoot,
        [],
        [],
        finalPositions,
        "bt-edge",
      );

      steps.push({
        nodes: finalNodes as RFNode[],
        edges: finalEdges as RFEdge[],
        description: "",
        codeStep: 0,
        treeAction: null,
        stepToCodeLine: stepToLine,
      });

      // Perform actual tree mutation
      setBTRoot(newRoot);

      return steps;
    },
    [setBTRoot],
  );

  const cancelAnimation = useCallback(() => {
    // No-op: step engine handles cancellation
  }, []);

  return { handleInsert, cancelAnimation };
}
