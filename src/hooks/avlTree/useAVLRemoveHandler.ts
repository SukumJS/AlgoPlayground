import { useCallback } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import type { TreeAnimationStep } from "@/src/hooks/tree/useStepTreeEngine";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import {
  searchAVL,
  removeAVLWithSteps,
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

export function useAVLRemoveHandler(params: {
  avlRoot: AVLTreeNode | null;
  setAVLRoot: (root: AVLTreeNode | null) => void;
  animationSpeed: number;
  rf: ReturnType<typeof useReactFlow>;
  animationCallbacks: AnimationCallbacks;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
  setRemoveValue: (v: string) => void;
}) {
  const { avlRoot, setAVLRoot } = params;

  const handleAVLRemove = useCallback(
    (value: number): TreeAnimationStep[] => {
      const stepToLine = [1, 4, 5, 6, 7, 8, 12];
      const treeAction = "avl-remove";
      const steps: TreeAnimationStep[] = [];

      if (!avlRoot) {
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

      const { found, nodeId, path } = searchAVL(avlRoot, value);
      const positions = calculateTreePositions(avlRoot);
      const rfData = avlTreeToReactFlow(avlRoot, [], [], positions);
      const rfNodes = rfData.nodes as RFNode[];
      const rfEdges = rfData.edges as RFEdge[];

      // Step 0: Initial state
      steps.push({
        nodes: rfNodes,
        edges: rfEdges,
        description: `Starting removal of ${value} from AVL tree.`,
        codeStep: 0,
        treeAction,
        stepToCodeLine: stepToLine,
      });

      // Steps: Traverse search path
      path.forEach((id) => {
        const hl = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === id,
            highlightColor: n.id === id ? "#62A2F7" : undefined,
          },
        }));
        const currentNode = rfNodes.find((n) => n.id === id);
        steps.push({
          nodes: hl,
          edges: rfEdges,
          description: `Searching for ${value} to remove. Compare with node ${currentNode?.data.label} and continue down the AVL path.`,
          codeStep: 1,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      });

      // Not found
      if (!found) {
        steps.push({
          nodes: rfNodes,
          edges: rfEdges,
          description: `Value ${value} was not found, so no node is removed.`,
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
        return steps;
      }

      // Step: Highlight found node (red)
      {
        const hl = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? "#EF4444" : undefined,
          },
        }));
        steps.push({
          nodes: hl,
          edges: rfEdges,
          description: `Found ${value}. Prepare to remove the node and rebalance if needed.`,
          codeStep: 0,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Pre-compute removal
      const { successorId, afterRemove, rotations, afterRebalance } =
        removeAVLWithSteps(avlRoot, value);

      // Step: Show successor if 2-child case
      if (successorId) {
        const hl = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === successorId || n.id === nodeId,
            highlightColor:
              n.id === successorId
                ? "#F7AD45"
                : n.id === nodeId
                  ? "#EF4444"
                  : undefined,
          },
        }));
        steps.push({
          nodes: hl,
          edges: rfEdges,
          description: `This node has two children. Find the inorder successor to replace it safely.`,
          codeStep: 1,
          treeAction,
          stepToCodeLine: stepToLine,
        });
      }

      // Step: Show tree after deletion (before rebalance)
      if (afterRemove) {
        const removedPositions = calculateTreePositions(afterRemove);
        const removedRF = avlTreeToReactFlow(
          afterRemove,
          [],
          [],
          removedPositions,
        );

        steps.push({
          nodes: removedRF.nodes as RFNode[],
          edges: removedRF.edges as RFEdge[],
          description: `Node removed. Move upward to check balance factors on ancestors.`,
          codeStep: 2,
          treeAction,
          stepToCodeLine: stepToLine,
        });

        // Steps: Check balance going back up for the first round
        const bfMap = collectBFs(afterRemove);
        const checkPath = [...path].reverse();
        const firstRotNodeId =
          rotations && rotations.length > 0 ? rotations[0].nodeId : null;

        checkPath.forEach((id) => {
          // Only add step if this node still exists in the afterRemove tree
          const nodeExists = (removedRF.nodes as RFNode[]).some(
            (n) => n.id === id,
          );
          if (!nodeExists) return;

          const hl = (removedRF.nodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === id,
              highlightColor:
                n.id === id
                  ? id === firstRotNodeId
                    ? "#EF4444"
                    : "#F7AD45"
                  : undefined,
              balanceFactor: bfMap.get(n.id),
            },
          }));
          const bf = bfMap.get(id) ?? 0;
          steps.push({
            nodes: hl,
            edges: removedRF.edges as RFEdge[],
            description:
              id === firstRotNodeId
                ? `Balance factor is ${bf}. This node is imbalanced, prepare for ${rotations[0].type}.`
                : `Balance factor is ${bf}. This node is balanced, continue upward.`,
            codeStep: id === firstRotNodeId ? 4 : 3,
            treeAction,
            stepToCodeLine: stepToLine,
          });
        });
      }

      // Steps: Rotation animations (cascading)
      if (rotations && rotations.length > 0 && afterRemove) {
        let currentIterTree = afterRemove;

        rotations.forEach((rot, index) => {
          const rotationType = rot.type;
          const rotationNodeId = rot.nodeId;
          const rotAfterTree = rot.afterTree;
          if (!rotAfterTree) return;

          const removedPositions = calculateTreePositions(currentIterTree);
          const removedRF = avlTreeToReactFlow(
            currentIterTree,
            [],
            [],
            removedPositions,
          );
          const finalPositions = calculateTreePositions(rotAfterTree);
          const finalRF = avlTreeToReactFlow(
            rotAfterTree,
            [],
            [],
            finalPositions,
          );

          // Highlight rotation node
          const hl = (removedRF.nodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === rotationNodeId,
              highlightColor: n.id === rotationNodeId ? "#EF4444" : undefined,
            },
          }));
          const hlEdges = (removedRF.edges as RFEdge[]).map((e: RFEdge) => ({
            ...e,
            style:
              e.source === rotationNodeId || e.target === rotationNodeId
                ? { stroke: "#EF4444", strokeWidth: 3 }
                : { stroke: "#999", strokeWidth: 2 },
          }));
          const nodeLabel = (removedRF.nodes as RFNode[]).find(
            (n) => n.id === rotationNodeId,
          )?.data.label;
          steps.push({
            nodes: hl,
            edges: hlEdges,
            description: `Imbalance detected at node ${nodeLabel}. Perform ${rotationType}.`,
            codeStep: 5,
            treeAction,
            stepToCodeLine: stepToLine,
          });

          // Topology re-wire
          const beforePosMap = new Map<string, { x: number; y: number }>();
          (removedRF.nodes as RFNode[]).forEach((n) => {
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
            codeStep: 5,
            treeAction,
            stepToCodeLine: stepToLine,
          });

          // Final rotation result for this iteration
          const isLast = index === rotations.length - 1;
          steps.push({
            nodes: finalRF.nodes as RFNode[],
            edges: finalRF.edges as RFEdge[],
            description: `${rotationType} complete. ${isLast ? "AVL balance is fully restored." : "Checking ancestors for further imbalances..."}`,
            codeStep: 6,
            treeAction,
            stepToCodeLine: stepToLine,
          });

          currentIterTree = rotAfterTree;
        });
      } else {
        // No rotation needed
        if (afterRebalance) {
          const finalPositions = calculateTreePositions(afterRebalance);
          const finalRF = avlTreeToReactFlow(
            afterRebalance,
            [],
            [],
            finalPositions,
          );
          steps.push({
            nodes: finalRF.nodes as RFNode[],
            edges: finalRF.edges as RFEdge[],
            description: `Removed ${value}. The tree remains balanced, so no rotation is required.`,
            codeStep: 6,
            treeAction,
            stepToCodeLine: stepToLine,
          });
        } else {
          steps.push({
            nodes: [],
            edges: [],
            description: `Removed ${value}. The tree is now empty.`,
            codeStep: 6,
            treeAction,
            stepToCodeLine: stepToLine,
          });
        }
      }

      // Final clean step
      if (afterRebalance) {
        const fPos = calculateTreePositions(afterRebalance);
        const fRF = avlTreeToReactFlow(afterRebalance, [], [], fPos);
        steps.push({
          nodes: fRF.nodes as RFNode[],
          edges: fRF.edges as RFEdge[],
          description: "",
          codeStep: 0,
          treeAction: null,
          stepToCodeLine: stepToLine,
        });
      } else {
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
      setAVLRoot(afterRebalance);

      return steps;
    },
    [avlRoot, setAVLRoot],
  );

  return handleAVLRemove;
}
