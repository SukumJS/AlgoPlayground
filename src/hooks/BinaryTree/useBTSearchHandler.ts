import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/types';
import { searchBT, calculateBTPositions, btToReactFlow, type BTNode } from '@/src/components/visualizer/algorithmsTree/binaryTree';

interface UseBTSearchHandlerProps {
  btRoot: BTNode | null;
  nodes: RFNode[];
  edges: RFEdge[];
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  applyHighlighting: AnimationCallbacks['applyHighlighting'];
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
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
  applyHighlighting,
  animationSpeed,
  isPausedRef,
}: UseBTSearchHandlerProps) {
  const controllerRef = useRef<AnimationController | null>(null);
  const btRootRef = useRef<BTNode | null>(btRoot);
  btRootRef.current = btRoot;

  const handleSearch = useCallback(
    (value: number) => {
      const root = btRootRef.current;
      if (!root) { setDescription('Tree is empty'); return; }

      controllerRef.current?.clearAll();
      const controller = new AnimationController(isPausedRef);
      controllerRef.current = controller;

      const { found, nodeId, path } = searchBT(root, value);
      const positions = calculateBTPositions(root);

      // Animate BFS traversal — only current node highlighted, edges accumulated
      let globalOffset = 0;
      path.forEach((id, idx) => {
        controller.scheduleStep(() => {
          const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(root, [], [], positions);

          // Node: highlight ONLY current node
          const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === id,
              highlightColor: n.id === id ? '#62A2F7' : undefined,
            },
          }));

          // Edges: accumulate highlighted path
          const visitedIds = new Set(path.slice(0, idx + 1));
          const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => ({
            ...e,
            style: (visitedIds.has(e.source) && visitedIds.has(e.target))
              ? { stroke: '#F7AD45', strokeWidth: 3 }
              : { stroke: '#999', strokeWidth: 2 },
          }));

          const currentNode = (rfNodes as RFNode[]).find(n => n.id === id);

          setNodes(highlighted);
          setEdges(highlightedEdges);
          setDescription(`Searching for ${value}. Now checking node ${currentNode?.data.label}.`);
        }, animationSpeed * (globalOffset + 1));
        globalOffset++; // Increment offset for the pause after description
        controller.scheduleStep(() => {
          // Keep description visible for a short duration
          // No visual change, just a pause
        }, animationSpeed * (globalOffset + 1));
        globalOffset++;
      });
      // Show result
      controller.scheduleStep(() => {
        const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(root, [], [], positions);
        if (found && nodeId) {
          const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === nodeId,
              highlightColor: n.id === nodeId ? '#4CAF7D' : undefined,
            },
          }));
          setNodes(highlighted);
          setDescription(`Found ${value}!`);
        } else {
          setNodes(rfNodes as RFNode[]);
          setDescription(`${value} was not found in the tree.`);
        }
        setEdges(rfEdges as RFEdge[]);

        controller.scheduleStep(() => {
          const { nodes: clean, edges: cleanE } = btToReactFlow(root, [], [], positions);
          setNodes(clean as RFNode[]);
          setEdges(cleanE as RFEdge[]);
          setDescription('');
        }, animationSpeed * 4); // Longer delay for final state
      }, animationSpeed * (path.length + 1));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationSpeed, isPausedRef, setNodes, setEdges, setDescription]
  );

  const cancelAnimation = useCallback(() => {
    controllerRef.current?.clearAll();
  }, []);

  return { handleSearch, cancelAnimation };
}
