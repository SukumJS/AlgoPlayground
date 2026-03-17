import { useCallback } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import {
  searchHeap,
  removeHeap,
  cloneHeap,
  calculateHeapPositions,
  heapToReactFlow,
  type HeapNode,
} from "@/src/components/visualizer/algorithmsTree/heapTree";

export function useHeapRemoveHandler(params: {
  heapRoot: HeapNode | null;
  setHeapRoot: (root: HeapNode | null) => void;
  isMinHeap: boolean;
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  setCodeStep?: (step: number) => void;
  setStepToCodeLine?: (map: number[]) => void;
  setTreeAction?: (action: string | null) => void;
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
}) {
  const {
    heapRoot,
    setHeapRoot,
    isMinHeap,
    setNodes,
    setEdges,
    setDescription,
    setCodeStep,
    setStepToCodeLine,
    setTreeAction,
    animationSpeed,
    isPausedRef,
    setIsAnimating,
  } = params;

  const handleRemove = useCallback(
    (value: number) => {
      const controller = new AnimationController(isPausedRef);
      setIsAnimating(true);
      if (!heapRoot) {
        setDescription("The heap is empty. There is nothing to remove.");
        setCodeStep?.(0);
        setTreeAction?.(null);
        setIsAnimating(false);
        return;
      }

      const stepToLine = [1, 2, 3, 4, 5, 6, 8];
      setTreeAction?.("heap-remove");
      setStepToCodeLine?.(stepToLine);
      setCodeStep?.(0);

      const { found, nodeId, path } = searchHeap(heapRoot, value);
      const positions = calculateHeapPositions(heapRoot);
      const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(
        heapRoot,
        [],
        [],
        positions,
        "heap-edge",
      );

      let globalOffset = 0;

      // Step 1: Animate search
      path.forEach((id, idx) => {
        controller.scheduleStep(
          () => {
            const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
              ...n,
              data: {
                ...n.data,
                isHighlighted: n.id === id,
                highlightColor: n.id === id ? "#62A2F7" : undefined,
              },
            }));
            const edgePath = path
              .slice(0, idx)
              .map((src, i) => `heap-edge-${src}-${path[i + 1]}`);
            const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => ({
              ...e,
              style: edgePath.includes(e.id)
                ? { stroke: "#F7AD45", strokeWidth: 3 }
                : { stroke: "#999", strokeWidth: 2 },
            }));
            setNodes(highlighted);
            setEdges(highlightedEdges);
            setDescription(
              `Searching for ${value}. Visiting node ${id} in level order.`,
            );
            setCodeStep?.(1);
          },
          animationSpeed * (idx + 1),
        );
        globalOffset = idx + 1;
      });

      if (!found) {
        globalOffset++;
        controller.scheduleStep(() => {
          setNodes(rfNodes as RFNode[]);
          setEdges(rfEdges as RFEdge[]);
          setDescription(`Value ${value} was not found in the heap.`);
          setCodeStep?.(0);
          setTreeAction?.(null);
          controller.scheduleStep(() => {
            setDescription("");
            setIsAnimating(false);
          }, animationSpeed * 2);
        }, animationSpeed * globalOffset);
        return;
      }

      // Step 2: Highlight target node in red
      globalOffset++;
      controller.scheduleStep(() => {
        const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? "#EF4444" : undefined,
          },
        }));
        setNodes(highlighted);
        setEdges(rfEdges as RFEdge[]);
        setDescription(
          `Found ${value}. Locate the deepest rightmost node to replace it.`,
        );
        setCodeStep?.(2);
      }, animationSpeed * globalOffset);

      // Calculate actual removal to get animation path
      const rootCopy = cloneHeap(heapRoot);
      const {
        root: newRoot,
        siftPath,
        lastNodeId,
        removedId,
      } = removeHeap(rootCopy, value, isMinHeap);

      if (!lastNodeId || !removedId) {
        // Only one node in tree, just remove it immediately
        globalOffset++;
        controller.scheduleStep(() => {
          setHeapRoot(null);
          setNodes([]);
          setEdges([]);
          setDescription(`Removed ${value}. The heap is now empty.`);
          setCodeStep?.(6);
          setTimeout(() => setIsAnimating(false), animationSpeed * 2);
        }, animationSpeed * globalOffset);
        return;
      }

      const targetOrigPos = positions.get(removedId)!;
      const lastOrigPos = positions.get(lastNodeId)!;

      // Step 3: Highlight last node (Purple)
      globalOffset++;
      controller.scheduleStep(() => {
        const extNodes = (rfNodes as RFNode[]).map((n) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === removedId || n.id === lastNodeId,
            highlightColor:
              n.id === removedId
                ? "#EF4444"
                : n.id === lastNodeId
                  ? "#F7AD45"
                  : undefined,
          },
        }));
        setNodes(extNodes);
        const foundNode = (rfNodes as RFNode[]).find(
          (n) => n.id === lastNodeId,
        );
        const labelStr = foundNode
          ? String((foundNode.data as Record<string, unknown>).label)
          : "";
        setDescription(
          `Deepest rightmost node is ${labelStr}. Move it to the removed node position.`,
        );
      }, animationSpeed * globalOffset);

      // Step 4: Geometry Untangle Fly-Up (15 frames)
      const INTERP_FRAMES = 15;
      let extNodesForFlight: RFNode[] = [];
      for (let frame = 1; frame <= INTERP_FRAMES; frame++) {
        controller.scheduleStep(
          () => {
            const progress = frame / INTERP_FRAMES;
            const currentX =
              lastOrigPos.x + (targetOrigPos.x - lastOrigPos.x) * progress;
            const currentY =
              lastOrigPos.y + (targetOrigPos.y - lastOrigPos.y) * progress;

            extNodesForFlight = (rfNodes as RFNode[])
              .filter((n) => n.id !== removedId) // Hide the removed node
              .map((n) => {
                if (n.id === lastNodeId) {
                  return {
                    ...n,
                    position: { x: currentX, y: currentY },
                    data: {
                      ...n.data,
                      isHighlighted: true,
                      highlightColor: "#F7AD45",
                    },
                  };
                }
                return n;
              });

            // Hide edges connected to the last node and target node during flight for clean visuals
            const flyingEdges = (rfEdges as RFEdge[]).filter(
              (e) =>
                e.target !== lastNodeId &&
                e.target !== removedId &&
                e.source !== removedId,
            );

            setNodes(extNodesForFlight);
            setEdges(flyingEdges);
          },
          animationSpeed * globalOffset +
            (animationSpeed / INTERP_FRAMES) * frame,
        );
      }
      globalOffset++; // consume time for the fly up

      // Tracking simulation tree for swaps
      const simTree = cloneHeap(heapRoot);
      // Find simulation target and last
      const simQueue = [simTree];
      let simTarget: HeapNode | null = null;
      let simLast: HeapNode | null = null;
      let simLastParent: HeapNode | null = null;

      while (simQueue.length > 0) {
        const cur = simQueue.shift()!;
        if (cur.id === removedId) simTarget = cur;
        if (cur.id === lastNodeId) {
          simLast = cur;
        }
        if (cur.left && cur.left.id === lastNodeId) simLastParent = cur;
        if (cur.right && cur.right.id === lastNodeId) simLastParent = cur;

        if (cur.left) simQueue.push(cur.left);
        if (cur.right) simQueue.push(cur.right);
      }

      // Apply deletion strictly on simulation tree
      if (simTarget && simLast) {
        simTarget.id = simLast.id;
        simTarget.value = simLast.value;
        if (simLastParent) {
          if (simLastParent.left?.id === simLast.id) simLastParent.left = null;
          else if (simLastParent.right?.id === simLast.id)
            simLastParent.right = null;
        }
      }

      // Snap to structured replaced state
      controller.scheduleStep(() => {
        const simPos = calculateHeapPositions(simTree);
        const { nodes: sn, edges: se } = heapToReactFlow(
          simTree,
          [],
          [],
          simPos,
          "heap-edge",
        );
        const snHigh = (sn as RFNode[]).map((n) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === lastNodeId,
            highlightColor: n.id === lastNodeId ? "#F7AD45" : undefined,
          },
        }));
        setNodes(snHigh);
        setEdges(se as RFEdge[]);
        setDescription(
          `Replacement complete. Check heap property and apply sift operations if needed.`,
        );
        setCodeStep?.(3);
      }, animationSpeed * globalOffset);

      // Step 5: Sift Swaps
      // Use a mutable variable so each step closure captures the CURRENT sifting node ID
      let currentSiftNodeId = lastNodeId;

      siftPath.forEach((swapId) => {
        // Capture current values for this step's closures
        const siftingId = currentSiftNodeId;
        const partnerId = swapId;
        const stepNum = siftPath.indexOf(swapId) + 1;

        globalOffset++;
        controller.scheduleStep(() => {
          const simPos = calculateHeapPositions(simTree);
          const { nodes: sn, edges: se } = heapToReactFlow(
            simTree,
            [],
            [],
            simPos,
            "heap-edge",
          );

          // Highlight the two nodes about to swap in yellow
          const snHigh = (sn as RFNode[]).map((n) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === siftingId || n.id === partnerId,
              highlightColor:
                n.id === siftingId || n.id === partnerId
                  ? "#F7AD45"
                  : undefined,
            },
          }));
          setNodes(snHigh);
          setEdges(se as RFEdge[]);
          setDescription(
            `Sift step ${stepNum} of ${siftPath.length}: swap with node ${swapId}.`,
          );
          setCodeStep?.(4);
        }, animationSpeed * globalOffset);

        // Interpolation frames for smooth node sliding
        const INTERP_FRAMES = 15;
        for (let frame = 1; frame <= INTERP_FRAMES; frame++) {
          controller.scheduleStep(
            () => {
              const simPos = calculateHeapPositions(simTree);
              const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(
                simTree,
                [],
                [],
                simPos,
                "heap-edge",
              );

              const posA = simPos.get(siftingId);
              const posB = simPos.get(partnerId);

              if (posA && posB) {
                const t = frame / INTERP_FRAMES;
                const currAX = posA.x + (posB.x - posA.x) * t;
                const currAY = posA.y + (posB.y - posA.y) * t;
                const currBX = posB.x + (posA.x - posB.x) * t;
                const currBY = posB.y + (posA.y - posB.y) * t;

                const movingNodes = (rfNodes as RFNode[]).map((n) => {
                  if (n.id === siftingId) {
                    return {
                      ...n,
                      position: { x: currAX, y: currAY },
                      data: {
                        ...n.data,
                        isHighlighted: true,
                        highlightColor: "#F7AD45",
                      },
                    };
                  }
                  if (n.id === partnerId) {
                    return {
                      ...n,
                      position: { x: currBX, y: currBY },
                      data: {
                        ...n.data,
                        isHighlighted: true,
                        highlightColor: "#F7AD45",
                      },
                    };
                  }
                  return n;
                });

                setNodes(movingNodes);
                setEdges(rfEdges as RFEdge[]);
              }
            },
            animationSpeed * globalOffset +
              (animationSpeed / INTERP_FRAMES) * frame,
          );
        }
        globalOffset++; // Advance time for interpolation

        // Execute the physical swap in simulation tree
        controller.scheduleStep(() => {
          let nodeA: HeapNode | null = null;
          let nodeB: HeapNode | null = null;
          const sq = [simTree];
          while (sq.length > 0) {
            const c = sq.shift()!;
            if (c.id === siftingId) nodeA = c;
            if (c.id === partnerId) nodeB = c;
            if (c.left) sq.push(c.left);
            if (c.right) sq.push(c.right);
          }
          if (nodeA && nodeB) {
            const tmpV = nodeA.value;
            const tmpI = nodeA.id;
            nodeA.value = nodeB.value;
            nodeA.id = nodeB.id;
            nodeB.value = tmpV;
            nodeB.id = tmpI;
          }
        }, animationSpeed * globalOffset);

        // After this swap our sifting node moved to partnerId position
        currentSiftNodeId = partnerId;
      });

      // Step 6: Finalize state
      globalOffset++;
      controller.scheduleStep(() => {
        setHeapRoot(newRoot);
        if (newRoot) {
          const newPositions = calculateHeapPositions(newRoot);
          const { nodes: newRFNodes, edges: newRFEdges } = heapToReactFlow(
            newRoot,
            [],
            [],
            newPositions,
            "heap-edge",
          );
          setNodes(newRFNodes as RFNode[]);
          setEdges(newRFEdges as RFEdge[]);
        } else {
          setNodes([]);
          setEdges([]);
        }
        setDescription(`Removal complete. Heap property is restored.`);
        setCodeStep?.(6);

        controller.scheduleStep(() => {
          setDescription("");
          setCodeStep?.(0);
          setTreeAction?.(null);
          setIsAnimating(false);
        }, animationSpeed * 2);
      }, animationSpeed * globalOffset);
    },
    [
      heapRoot,
      setHeapRoot,
      isMinHeap,
      setNodes,
      setEdges,
      setDescription,
      animationSpeed,
      isPausedRef,
      setIsAnimating,
      setCodeStep,
      setStepToCodeLine,
      setTreeAction,
    ],
  );

  return { handleRemove };
}
