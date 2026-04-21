import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import {
  findInsertionPosition,
  insertAVLWithSteps,
  calculateTreePositions,
  avlTreeToReactFlow,
  getBalanceFactor,
  type AVLTreeNode,
} from "@/src/components/visualizer/algorithmsTree/avlTree";

function collectBFs(
  node: AVLTreeNode | null,
  map: Map<string, number> = new Map(),
): Map<string, number> {
  if (!node) return map;
  map.set(node.id, getBalanceFactor(node));
  collectBFs(node.left, map);
  collectBFs(node.right, map);
  return map;
}

export function useAVLInsertHandler(params: {
  avlRoot: AVLTreeNode | null;
  setAVLRoot: (root: AVLTreeNode | null) => void;
  nodeIdCounter: number;
  animationSpeed: number;
  rf: ReturnType<typeof useReactFlow>;
  animationCallbacks: AnimationCallbacks;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
  setAnimationDescription: (v: string) => void;
  setNodeIdCounter: (v: number) => void;
}) {
  const { avlRoot, setAVLRoot, nodeIdCounter, setNodeIdCounter } = params;

  const counterRef = useRef(0);
  const avlRootRef = useRef<AVLTreeNode | null>(avlRoot);
  useEffect(() => {
    avlRootRef.current = avlRoot;
  }, [avlRoot]);

  const handleAVLInsert = useCallback(
    (valueToInsert: number): TreeAnimationStep[] => {
      const stepToLine = [1, 4, 6, 7, 8, 13];
      const treeAction = "avl-insert";
      const steps: TreeAnimationStep[] = [];
      const latestRoot = avlRootRef.current;

      // Duplicate check
      const insertionPos = findInsertionPosition(latestRoot, valueToInsert);
      if (
        latestRoot &&
        insertionPos.parentId === null &&
        latestRoot.value === valueToInsert
      ) {
        const positions = calculateTreePositions(latestRoot);
        const rfData = avlTreeToReactFlow(latestRoot, [], [], positions);
        steps.push({
          nodes: rfData.nodes as RFNode[],
          edges: rfData.edges as RFEdge[],
          description: `Value ${valueToInsert} already exists. AVL does not insert duplicates.`,
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
        return steps;
      }

      const newNodeId = `avl_${nodeIdCounter}_${counterRef.current++}`;
      const path = insertionPos.path || [];
      const parentId = insertionPos.parentId;
      const parentValue = insertionPos.parentValue;
      const position = insertionPos.position;

      // Pre-compute all intermediate states
      const { afterInsert, rotationType, rotationNodeId, afterRebalance } =
        insertAVLWithSteps(latestRoot, valueToInsert, newNodeId);

      // Build ReactFlow for each state
      const oldPositions = calculateTreePositions(latestRoot);
      const oldRF = latestRoot
        ? avlTreeToReactFlow(latestRoot, [], [], oldPositions)
        : { nodes: [], edges: [] };

      const insertedPositions = calculateTreePositions(afterInsert);
      const insertedRF = avlTreeToReactFlow(
        afterInsert,
        [],
        [],
        insertedPositions,
      );

      const finalPositions = calculateTreePositions(afterRebalance);
      const finalRF = avlTreeToReactFlow(
        afterRebalance,
        [],
        [],
        finalPositions,
      );

      // Step 0: Initial state
      steps.push({
        nodes: oldRF.nodes as RFNode[],
        edges: oldRF.edges as RFEdge[],
        description: `Starting insertion of ${valueToInsert} into AVL tree.`,
        codeStep: 0,
        treeAction,
        stepToCodeLine: stepToLine,
      });

      // Steps: Traverse path
      path.forEach((nodeId, idx) => {
        const hl = (oldRF.nodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? "#62A2F7" : undefined,
          },
        }));
        const visitedIds = new Set(path.slice(0, idx + 1));
        const hlEdges = (oldRF.edges as RFEdge[]).map((e: RFEdge) => ({
          ...e,
          style:
            visitedIds.has(e.source) && visitedIds.has(e.target)
              ? { stroke: "#F7AD45", strokeWidth: 3 }
              : { stroke: "#999", strokeWidth: 2 },
        }));
        const currentNode = (oldRF.nodes as RFNode[]).find(
          (n) => n.id === nodeId,
        );
        steps.push({
          nodes: hl,
          edges: hlEdges,
          description: `Finding where to insert ${valueToInsert}. Compare with node ${currentNode?.data.label} and move left or right.`,
          codeStep: 1,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      });

      // Step: Highlight parent
      if (parentId) {
        const hl = (oldRF.nodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === parentId,
            highlightColor: n.id === parentId ? "#F7AD45" : undefined,
          },
        }));
        steps.push({
          nodes: hl,
          edges: oldRF.edges as RFEdge[],
          description: `Found an empty ${position} child slot under node ${parentValue}.`,
          codeStep: 1,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Step: Show tree after BST insert
      {
        const hl = (insertedRF.nodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === newNodeId,
            highlightColor: n.id === newNodeId ? "#4CAF7D" : undefined,
          },
        }));
        steps.push({
          nodes: hl,
          edges: insertedRF.edges as RFEdge[],
          description: `Inserted ${valueToInsert}. Move upward to check balance factors on ancestors.`,
          codeStep: 2,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Steps: Check balance going back up
      const bfMap = collectBFs(afterInsert);
      const reversePath = [...path].reverse();
      reversePath.forEach((nodeId) => {
        const hl = (insertedRF.nodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor:
              n.id === nodeId
                ? nodeId === rotationNodeId
                  ? "#EF4444"
                  : "#F7AD45"
                : n.id === newNodeId
                  ? "#4CAF7D"
                  : undefined,
            balanceFactor: bfMap.get(n.id),
          },
        }));
        const bf = bfMap.get(nodeId) ?? 0;
        steps.push({
          nodes: hl,
          edges: insertedRF.edges as RFEdge[],
          description:
            nodeId === rotationNodeId
              ? `Balance factor is ${bf}. This node is imbalanced, so apply ${rotationType}.`
              : `Balance factor is ${bf}. This node is balanced, continue upward.`,
          codeStep: nodeId === rotationNodeId ? 3 : 2,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      });

      // Steps: Rotation animation (if needed)
      if (rotationType) {
        // Highlight rotation node
        const hl = (insertedRF.nodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === rotationNodeId,
            highlightColor: n.id === rotationNodeId ? "#EF4444" : undefined,
          },
        }));
        const hlEdges = (insertedRF.edges as RFEdge[]).map((e: RFEdge) => ({
          ...e,
          style:
            e.source === rotationNodeId || e.target === rotationNodeId
              ? { stroke: "#EF4444", strokeWidth: 3 }
              : { stroke: "#999", strokeWidth: 2 },
        }));
        const nodeLabel = insertedRF.nodes.find((n) => n.id === rotationNodeId)
          ?.data.label;
        steps.push({
          nodes: hl,
          edges: hlEdges,
          description: `Imbalance detected at node ${nodeLabel}. Perform ${rotationType}.`,
          codeStep: 4,
          treeAction,
          stepToCodeLine: stepToLine,
        });

        // Topology re-wire (old positions, new edges)
        const beforePosMap = new Map<string, { x: number; y: number }>();
        (insertedRF.nodes as RFNode[]).forEach((n) => {
          beforePosMap.set(n.id, { x: n.position.x, y: n.position.y });
        });

        const tangledNodes = (finalRF.nodes as RFNode[]).map((n: RFNode) => {
          const before = beforePosMap.get(n.id) || n.position;
          return {
            ...n,
            position: before,
            data: {
              ...n.data,
              isHighlighted: n.id === rotationNodeId,
              highlightColor: n.id === rotationNodeId ? "#F7AD45" : undefined,
            },
          };
        });
        const tangledEdges = (finalRF.edges as RFEdge[]).map((e: RFEdge) => ({
          ...e,
          style:
            e.source === rotationNodeId || e.target === rotationNodeId
              ? { stroke: "#F7AD45", strokeWidth: 3 }
              : { stroke: "#999", strokeWidth: 2 },
        }));
        steps.push({
          nodes: tangledNodes,
          edges: tangledEdges,
          description: "Update child links for the rotation topology.",
          codeStep: 4,
          treeAction,
          stepToCodeLine: stepToLine,
        });

        // Final rotation result (nodes in final positions)
        steps.push({
          nodes: finalRF.nodes as RFNode[],
          edges: finalRF.edges as RFEdge[],
          description: `${rotationType} complete. AVL balance is restored.`,
          codeStep: 5,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      } else {
        steps.push({
          nodes: finalRF.nodes as RFNode[],
          edges: finalRF.edges as RFEdge[],
          description: `All nodes are balanced. No rotation was needed.`,
          codeStep: 5,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Final clean step
      steps.push({
        nodes: finalRF.nodes as RFNode[],
        edges: finalRF.edges as RFEdge[],
        description: "",
        codeStep: 0,
        treeAction: null,
        stepToCodeLine: stepToLine,
      });

      // Perform actual tree mutation
      setAVLRoot(afterRebalance);
      setNodeIdCounter(nodeIdCounter + 1);

      return steps;
    },
    [setAVLRoot, nodeIdCounter, setNodeIdCounter],
  );

  return handleAVLInsert;
}
