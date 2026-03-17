import { useCallback, useRef } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
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
  applyHighlighting: AnimationCallbacks["applyHighlighting"];
  setCodeStep?: AnimationCallbacks["setCodeStep"];
  setStepToCodeLine?: AnimationCallbacks["setStepToCodeLine"];
  setTreeAction?: AnimationCallbacks["setTreeAction"];
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (v: boolean) => void;
}

/**
 * Hook: BT Search Handler
 * - Node highlight: current node ONLY (not persisted)
 * - Edge highlight: accumulated path (persisted), color #F7AD45
 */
export function useBTSearchHandler({
  btRoot,
  setNodes,
  setEdges,
  setDescription,
  applyHighlighting: _applyHighlighting,
  setCodeStep,
  setStepToCodeLine,
  setTreeAction,
  animationSpeed,
  isPausedRef,
  setIsAnimating,
}: UseBTSearchHandlerProps) {
  void _applyHighlighting;
  const controllerRef = useRef<AnimationController | null>(null);
  const btRootRef = useRef<BTNode | null>(btRoot);
  btRootRef.current = btRoot;

  const handleSearch = useCallback(
    (value: number) => {
      const root = btRootRef.current;
      if (!root) {
        setDescription("The tree is empty. Insert a node first.");
        setCodeStep?.(0);
        setTreeAction?.(null);
        return;
      }

      controllerRef.current?.clearAll();
      const controller = new AnimationController(isPausedRef);
      controllerRef.current = controller;
      setIsAnimating(true);

      const stepToLine = [1, 2, 5, 6, 7, 10, 11];
      setTreeAction?.("bt-search");
      setStepToCodeLine?.(stepToLine);
      setCodeStep?.(0);

      const { found, nodeId, path } = searchBT(root, value);
      const positions = calculateBTPositions(root);

      // Animate BFS traversal — only current node highlighted, edges accumulated
      let globalOffset = 0;
      path.forEach((id, idx) => {
        controller.scheduleStep(
          () => {
            const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(
              root,
              [],
              [],
              positions,
            );

            // Node: highlight ONLY current node
            const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
              ...n,
              data: {
                ...n.data,
                isHighlighted: n.id === id,
                highlightColor: n.id === id ? "#62A2F7" : undefined,
              },
            }));

            // Edges: accumulate highlighted path
            const visitedIds = new Set(path.slice(0, idx + 1));
            const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => ({
              ...e,
              style:
                visitedIds.has(e.source) && visitedIds.has(e.target)
                  ? { stroke: "#F7AD45", strokeWidth: 3 }
                  : { stroke: "#999", strokeWidth: 2 },
            }));

            const currentNode = (rfNodes as RFNode[]).find((n) => n.id === id);

            setNodes(highlighted);
            setEdges(highlightedEdges);
            setDescription(
              `Searching for ${value}. Check node ${currentNode?.data.label} in level order.`,
            );
            setCodeStep?.(3);
          },
          animationSpeed * (globalOffset + 1),
        );
        globalOffset++; // Increment offset for the pause after description
        controller.scheduleStep(
          () => {
            // Keep description visible for a short duration
            // No visual change, just a pause
          },
          animationSpeed * (globalOffset + 1),
        );
        globalOffset++;
      });
      // Show result
      controller.scheduleStep(
        () => {
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
            setNodes(highlighted);
            setDescription(`Value ${value} found. This is the matching node.`);
            setCodeStep?.(5);
          } else {
            setNodes(rfNodes as RFNode[]);
            setDescription(
              `Value ${value} was not found after visiting all reachable nodes.`,
            );
            setCodeStep?.(6);
          }
          setEdges(rfEdges as RFEdge[]);

          controller.scheduleStep(() => {
            const { nodes: clean, edges: cleanE } = btToReactFlow(
              root,
              [],
              [],
              positions,
            );
            setNodes(clean as RFNode[]);
            setEdges(cleanE as RFEdge[]);
            setDescription("");
            setCodeStep?.(0);
            setTreeAction?.(null);
            setIsAnimating(false);
          }, animationSpeed * 4); // Longer delay for final state
        },
        animationSpeed * (path.length + 1),
      );
    },

    [
      animationSpeed,
      isPausedRef,
      setNodes,
      setEdges,
      setDescription,
      setIsAnimating,
      setCodeStep,
      setStepToCodeLine,
      setTreeAction,
    ],
  );

  const cancelAnimation = useCallback(() => {
    controllerRef.current?.clearAll();
  }, []);

  return { handleSearch, cancelAnimation };
}
