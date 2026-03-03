import { useCallback, useRef, MutableRefObject } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import {
  findInsertionPosition,
  insertAVLWithSteps,
  calculateTreePositions,
  avlTreeToReactFlow,
  getBalanceFactor,
  type AVLTreeNode,
} from "@/src/components/visualizer/algorithmsTree/avlTree";

/** Collect balance factors for all nodes in an AVL tree */
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

function cloneAVL(node: AVLTreeNode | null): AVLTreeNode | null {
  if (!node) return null;
  return JSON.parse(JSON.stringify(node));
}

export function useAVLInsertHandler(params: {
  avlRoot: AVLTreeNode | null;
  setAVLRoot: (root: AVLTreeNode | null) => void;
  nodeIdCounter: number;
  animationSpeed: number;
  rf: ReturnType<typeof useReactFlow>;
  animationCallbacks: AnimationCallbacks;
  isPausedRef: MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
  setAnimationDescription: (desc: string) => void;
  setNodeIdCounter: (v: number) => void;
}) {
  const {
    avlRoot,
    setAVLRoot,
    nodeIdCounter,
    animationSpeed,
    animationCallbacks,
    isPausedRef,
    setIsAnimating,
    setAnimationDescription,
    setNodeIdCounter,
  } = params;

  const counterRef = useRef(0);

  const handleAVLInsert = useCallback(
    (valueToInsert: number) => {
      const controller = new AnimationController(isPausedRef);
      setIsAnimating(true);

      const latestRoot = avlRoot;

      // --- Duplicate check ---
      const insertionPos = findInsertionPosition(latestRoot, valueToInsert);
      if (
        latestRoot &&
        insertionPos.parentId === null &&
        latestRoot.value === valueToInsert
      ) {
        setIsAnimating(false);
        setAnimationDescription(`Value ${valueToInsert} already exists!`);
        setTimeout(() => setAnimationDescription(""), 2000);
        return;
      }

      const newNodeId = `avl_${nodeIdCounter}_${counterRef.current++}`;
      const path = insertionPos.path || [];
      const parentId = insertionPos.parentId;
      const parentValue = insertionPos.parentValue;
      const position = insertionPos.position;

      // --- Pre-compute all intermediate states ---
      const { afterInsert, rotationType, rotationNodeId, afterRebalance } =
        insertAVLWithSteps(latestRoot, valueToInsert, newNodeId);

      // --- Build ReactFlow for each state ---
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

      let offset = 0;

      // ── Step 1: Traverse path (highlight each node visited) ──
      if (path.length > 0) {
        path.forEach((nodeId, idx) => {
          controller.scheduleStep(
            () => {
              // Node: highlight ONLY the current node being visited
              const hl = (oldRF.nodes as RFNode[]).map((n: RFNode) => ({
                ...n,
                data: {
                  ...n.data,
                  isHighlighted: n.id === nodeId,
                  highlightColor: n.id === nodeId ? "#62A2F7" : undefined,
                },
              }));

              // Edges: accumulate highlighted path
              const visitedIds = new Set(path.slice(0, idx + 1));
              const hlEdges = (oldRF.edges as RFEdge[]).map((e: RFEdge) => ({
                ...e,
                style:
                  visitedIds.has(e.source) && visitedIds.has(e.target)
                    ? { stroke: "#F7AD45", strokeWidth: 3 }
                    : { stroke: "#999", strokeWidth: 2 },
              }));

              animationCallbacks.setNodes(hl);
              animationCallbacks.setEdges(hlEdges);
              const currentNode = (oldRF.nodes as RFNode[]).find(
                (n) => n.id === nodeId,
              );
              setAnimationDescription(
                `Finding insertion spot for ${valueToInsert}. Comparing with ${currentNode?.data.label}.`,
              );
            },
            animationSpeed * (idx + 1),
          );
          offset = idx + 1;
        });
      }

      // ── Step 2: Highlight parent (yellow) ──
      if (parentId) {
        offset++;
        controller.scheduleStep(() => {
          const hl = (oldRF.nodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === parentId,
              highlightColor: n.id === parentId ? "#F7AD45" : undefined,
            },
          }));
          animationCallbacks.setNodes(hl);
          setAnimationDescription(
            `Found insertion spot. Inserting ${valueToInsert} as the ${position} child of node ${parentValue}.`,
          );
        }, animationSpeed * offset);
        offset++; // Pause after description
        controller.scheduleStep(() => {}, animationSpeed * offset);
      }

      // ── Step 3: Show tree after BST insert (before rebalance) ──
      offset++;
      controller.scheduleStep(() => {
        const hl = (insertedRF.nodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === newNodeId,
            highlightColor: n.id === newNodeId ? "#4CAF7D" : undefined,
          },
        }));
        animationCallbacks.setNodes(hl);
        animationCallbacks.setEdges(insertedRF.edges as RFEdge[]);
        setAnimationDescription(
          `Inserted ${valueToInsert}. Now, walking back up to check balance factors.`,
        );
      }, animationSpeed * offset);
      offset++; // Pause after description
      controller.scheduleStep(() => {}, animationSpeed * offset);

      // ── Step 4: Check balance — highlight path back up with BF badges ──
      const bfMap = collectBFs(afterInsert);
      const reversePath = [...path].reverse();
      reversePath.forEach((nodeId, idx) => {
        offset++;
        controller.scheduleStep(() => {
          const hl = (insertedRF.nodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === nodeId,
              highlightColor:
                n.id === nodeId
                  ? nodeId === rotationNodeId
                    ? "#EF4444"
                    : "#9B59B6"
                  : n.id === newNodeId
                    ? "#4CAF7D"
                    : undefined,
              balanceFactor: bfMap.get(n.id),
            },
          }));
          animationCallbacks.setNodes(hl);
          const bf = bfMap.get(nodeId) ?? 0;
          if (nodeId === rotationNodeId) {
            const nodeLabel = hl.find((n) => n.id === nodeId)?.data as
              | Record<string, unknown>
              | undefined;
            setAnimationDescription(
              `Balance Factor = ${bf} — Imbalanced! Need ${rotationType}.`,
            );
          } else {
            const nodeLabel = hl.find((n) => n.id === nodeId)?.data as
              | Record<string, unknown>
              | undefined;
            setAnimationDescription(
              `Balance Factor = ${bf} — Balanced . Continuing up...`,
            );
          }
        }, animationSpeed * offset);
      });

      // ── Step 5: If rotation needed, animate the rotation ──
      if (rotationType) {
        // Build position maps: before-rotation → after-rotation
        const beforePosMap = new Map<string, { x: number; y: number }>();
        (insertedRF.nodes as RFNode[]).forEach((n) => {
          beforePosMap.set(n.id, { x: n.position.x, y: n.position.y });
        });
        const afterPosMap = new Map<string, { x: number; y: number }>();
        (finalRF.nodes as RFNode[]).forEach((n) => {
          afterPosMap.set(n.id, { x: n.position.x, y: n.position.y });
        });

        // Step 5a: "About to rotate" — highlight rotation node on the unbalanced tree
        offset++;
        controller.scheduleStep(() => {
          const hl = (insertedRF.nodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === rotationNodeId,
              highlightColor: n.id === rotationNodeId ? "#EF4444" : undefined,
            },
          }));
          // Highlight the edges connected to rotation node
          const hlEdges = (insertedRF.edges as RFEdge[]).map((e: RFEdge) => ({
            ...e,
            style:
              e.source === rotationNodeId || e.target === rotationNodeId
                ? { stroke: "#EF4444", strokeWidth: 3 }
                : { stroke: "#999", strokeWidth: 2 },
          }));
          animationCallbacks.setNodes(hl);
          animationCallbacks.setEdges(hlEdges);
          const nodeLabel = insertedRF.nodes.find(
            (n) => n.id === rotationNodeId,
          )?.data.label;
          setAnimationDescription(
            `Imbalance at node ${nodeLabel}. Performing ${rotationType}...`,
          );
        }, animationSpeed * offset);
        offset++; // Pause after description
        controller.scheduleStep(() => {}, animationSpeed * offset);

        // Step 5b: Reassign Edges (Topology Update)
        offset++;
        controller.scheduleStep(() => {
          // Keep the nodes in their original (before-rotation) positions, but use finalRF edges
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

          // Highlight the new final edges that involve the rotation node to show they changed
          const hlEdges = (finalRF.edges as RFEdge[]).map((e: RFEdge) => ({
            ...e,
            style:
              e.source === rotationNodeId || e.target === rotationNodeId
                ? { stroke: "#F7AD45", strokeWidth: 3 }
                : { stroke: "#999", strokeWidth: 2 },
          }));

          animationCallbacks.setNodes(tangledNodes);
          animationCallbacks.setEdges(hlEdges);
          setAnimationDescription(`Disconnecting & Reassigning Child Nodes...`);
        }, animationSpeed * offset);

        offset++; // Pause after description
        controller.scheduleStep(() => {}, animationSpeed * offset);

        // Step 5c: Interpolation frames (Geometry Update)
        const INTERP_FRAMES = 15;
        for (let frame = 1; frame <= INTERP_FRAMES; frame++) {
          const t = frame / INTERP_FRAMES; // 0→1 progress

          // We add offsets fractionally so the total interpolation takes `animationSpeed` ms
          const fractionOffset = offset + frame / INTERP_FRAMES;

          controller.scheduleStep(() => {
            const interpolated = (finalRF.nodes as RFNode[]).map(
              (n: RFNode) => {
                const before = beforePosMap.get(n.id);
                const after = afterPosMap.get(n.id);

                let pos = n.position;
                if (before && after) {
                  pos = {
                    x: before.x + (after.x - before.x) * t,
                    y: before.y + (after.y - before.y) * t,
                  };
                } else if (!before && after) {
                  pos = after;
                }

                return {
                  ...n,
                  position: pos,
                  data: {
                    ...n.data,
                    isHighlighted: n.id === rotationNodeId,
                    highlightColor:
                      n.id === rotationNodeId ? "#4CAF7D" : undefined,
                  },
                };
              },
            );
            animationCallbacks.setNodes(interpolated);
            animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
            setAnimationDescription(
              `Re-arranging nodes to the new structure...`,
            );
          }, animationSpeed * fractionOffset);
        }
        // Advance integer offset past the fractional frames
        offset++;
        // No explicit pause needed here, as the next step is the final rotation result.

        // Step 5d: Final rotation result
        offset++;
        controller.scheduleStep(() => {
          animationCallbacks.setNodes(finalRF.nodes as RFNode[]);
          animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
          setAnimationDescription(
            `${rotationType} complete. The tree is now balanced.`,
          );
        }, animationSpeed * offset);
        offset++; // Pause after description
        controller.scheduleStep(() => {}, animationSpeed * offset);
      } else {
        offset++;
        controller.scheduleStep(() => {
          animationCallbacks.setNodes(finalRF.nodes as RFNode[]);
          animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
          setAnimationDescription(
            `All nodes are balanced. No rotation was needed.`,
          );
        }, animationSpeed * offset);
        offset++; // Pause after description
        controller.scheduleStep(() => {}, animationSpeed * offset);
      }

      // ── Step 6: Final clean state ──
      offset++;
      controller.scheduleStep(() => {
        setAVLRoot(afterRebalance);
        animationCallbacks.setNodes(finalRF.nodes as RFNode[]);
        animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
        setAnimationDescription("");
        setIsAnimating(false);
        setNodeIdCounter(nodeIdCounter + 1);
      }, animationSpeed * offset);
    },
    [
      avlRoot,
      setAVLRoot,
      nodeIdCounter,
      animationSpeed,
      animationCallbacks,
      isPausedRef,
      setIsAnimating,
      setAnimationDescription,
      setNodeIdCounter,
    ],
  );

  return handleAVLInsert;
}
