import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/types';
import { removeBT, searchBT, calculateBTPositions, btToReactFlow, cloneBT, type BTNode } from '@/src/components/visualizer/algorithmsTree/BinaryTree/binaryTree';

interface UseBTRemoveHandlerProps {
  btRoot: BTNode | null;
  setBTRoot: (root: BTNode | null) => void;
  nodes: RFNode[];
  edges: RFEdge[];
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  applyHighlighting: AnimationCallbacks['applyHighlighting'];
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
}

export function useBTRemoveHandler({
  btRoot,
  setBTRoot,
  setNodes,
  setEdges,
  setDescription,
  animationSpeed,
  isPausedRef,
}: UseBTRemoveHandlerProps) {
  const controllerRef = useRef<AnimationController | null>(null);
  const btRootRef = useRef<BTNode | null>(btRoot);
  btRootRef.current = btRoot;

  const handleRemove = useCallback(
    (value: number) => {
      const root = btRootRef.current;
      if (!root) { setDescription('Tree is empty'); return; }

      const { found, nodeId } = searchBT(root, value);
      if (!found) { setDescription(`Value ${value} not found`); return; }

      controllerRef.current?.clearAll();
      const controller = new AnimationController(isPausedRef);
      controllerRef.current = controller;

      // animate: BFS path
      const searchPath: string[] = [];
      const edgePath: string[] = [];

      if (root) {
        const queue: BTNode[] = [root];
        while (queue.length > 0) {
          const cur = queue.shift()!;
          searchPath.push(cur.id);
          if (cur.value === value) break;
          if (cur.left) { queue.push(cur.left); edgePath.push(`bt-edge-${cur.id}-${cur.left.id}`); }
          if (cur.right) { queue.push(cur.right); edgePath.push(`bt-edge-${cur.id}-${cur.right.id}`); }
        }
      }

      const positions = calculateBTPositions(root);
      const rfData = btToReactFlow(root, [], [], positions);
      const rfNodes = rfData.nodes as RFNode[];
      const rfEdges = rfData.edges as RFEdge[];

      let globalOffset = 0;

      // Step 1: Traverse search path
      if (root && searchPath.length > 0) {
        searchPath.forEach((id, idx) => {
          controller.scheduleStep(() => {
            const highlightedNodes = rfNodes.map((n: RFNode) => ({
              ...n,
              data: {
                ...n.data,
                isHighlighted: n.id === id,
                highlightColor: n.id === id ? '#62A2F7' : undefined,
              },
            }));

            const highlightedEdges = rfEdges.map((e: RFEdge) => {
              const isHighlightedEdge = edgePath.slice(0, idx).includes(e.id);
              return {
                ...e,
                style: isHighlightedEdge
                  ? { stroke: '#F7AD45', strokeWidth: 3 }
                  : { stroke: '#999', strokeWidth: 2 },
              };
            });

            setNodes(highlightedNodes);
            setEdges(highlightedEdges);
            setDescription(`Searching for ${value}... visiting node`);
          }, animationSpeed * (idx + 1));
          globalOffset = idx + 1;
        });
      }

      // Step 2: Highlight node to delete (Red)
      globalOffset++;
      controller.scheduleStep(() => {
        const highlighted = rfNodes.map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? '#EF4444' : undefined,
          },
        }));
        setNodes(highlighted);
        setEdges(rfEdges);
        setDescription(`❌ Found ${value}! Removing...`);
      }, animationSpeed * globalOffset);

      // --- Pre-compute removal and new state ---
      const rootCopy = cloneBT(root);
      const { newRoot, deepestId } = removeBT(rootCopy, value);

      // Step 3: Highlight the deepest rightmost node (Replacement) if it exists
      if (deepestId && nodeId !== deepestId) {
        globalOffset++;
        controller.scheduleStep(() => {
          const highlighted = rfNodes.map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === nodeId || n.id === deepestId,
              highlightColor: n.id === nodeId ? '#EF4444' : (n.id === deepestId ? '#F7AD45' : undefined),
            },
          }));
          setNodes(highlighted);
          setEdges(rfEdges);
          setDescription(`🔄 Replacing with deepest, rightmost node...`);
        }, animationSpeed * globalOffset);
      }

      // Step 4: Perform Removal and Animate Structural Shift
      if (newRoot) {
        const finalPositions = calculateBTPositions(newRoot);
        // Use prefix 'bt-edge' to match what's expected for binary trees in btToReactFlow
        const finalRF = btToReactFlow(newRoot, [], [], finalPositions, 'bt-edge');

        const beforePosMap = new Map<string, { x: number; y: number }>();
        rfNodes.forEach(n => {
          beforePosMap.set(n.id, { x: n.position.x, y: n.position.y });
        });
        const afterPosMap = new Map<string, { x: number; y: number }>();
        (finalRF.nodes as RFNode[]).forEach(n => {
          afterPosMap.set(n.id, { x: n.position.x, y: n.position.y });
        });

        // Step 4a: Topology Re-wire
        globalOffset++;
        controller.scheduleStep(() => {
          const tangledNodes = (finalRF.nodes as RFNode[]).map((n: RFNode) => {
            // The node taking the target's place (which took target's ID) comes from the deepest node's old position
            const isReplacement = deepestId && n.id === nodeId;
            const beforePosId = isReplacement ? deepestId : n.id;
            const before = beforePosMap.get(beforePosId) || n.position;

            return {
              ...n,
              position: before,
              data: {
                ...n.data,
                isHighlighted: n.id === nodeId,
                highlightColor: n.id === nodeId ? '#F7AD45' : undefined,
              },
            };
          });

          const hlEdges = (finalRF.edges as RFEdge[]).map((e: RFEdge) => ({
            ...e,
            style: (e.source === nodeId || e.target === nodeId)
              ? { stroke: '#F7AD45', strokeWidth: 3 }
              : { stroke: '#999', strokeWidth: 2 },
          }));

          setNodes(tangledNodes);
          setEdges(hlEdges);
          setDescription('🔗 Re-wiring tree structure...');
        }, animationSpeed * globalOffset);

        // Step 4b: Geometry Untangle (15 frames)
        const INTERP_FRAMES = 15;
        for (let frame = 1; frame <= INTERP_FRAMES; frame++) {
          const t = frame / INTERP_FRAMES;
          const fractionOffset = globalOffset + (frame / INTERP_FRAMES);

          controller.scheduleStep(() => {
            const interpolated = (finalRF.nodes as RFNode[]).map((n: RFNode) => {
              const isReplacement = deepestId && n.id === nodeId;
              const beforePosId = isReplacement ? deepestId : n.id;

              const before = beforePosMap.get(beforePosId);
              const after = afterPosMap.get(n.id);

              let pos = n.position;
              if (before && after) {
                pos = {
                  x: before.x + (after.x - before.x) * t,
                  y: before.y + (after.y - before.y) * t,
                };
              }

              return {
                ...n,
                position: pos,
                data: {
                  ...n.data,
                  isHighlighted: n.id === nodeId,
                  highlightColor: n.id === nodeId ? '#4CAF7D' : undefined,
                },
              };
            });

            setNodes(interpolated);
            setEdges(finalRF.edges as RFEdge[]);
            setDescription('✨ Structuring tree layout...');
          }, animationSpeed * fractionOffset);
        }
        globalOffset++;

        // Step 4c: Final State Update
        globalOffset++;
        controller.scheduleStep(() => {
          setBTRoot(newRoot);
          setNodes(finalRF.nodes as RFNode[]);
          setEdges(finalRF.edges as RFEdge[]);
          setDescription(`✅ Removed ${value}.`);
          controller.scheduleStep(() => setDescription(''), animationSpeed * 2);
        }, animationSpeed * globalOffset);

      } else {
        // Tree is completely empty
        globalOffset++;
        controller.scheduleStep(() => {
          setBTRoot(null);
          setNodes([]);
          setEdges([]);
          setDescription(`✅ Removed ${value}. Tree is empty.`);
          controller.scheduleStep(() => setDescription(''), animationSpeed * 2);
        }, animationSpeed * globalOffset);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationSpeed, isPausedRef, setBTRoot, setNodes, setEdges, setDescription]
  );

  const cancelAnimation = useCallback(() => {
    controllerRef.current?.clearAll();
  }, []);

  return { handleRemove, cancelAnimation };
}
