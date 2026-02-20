/**
 * useBTSearchHandler — Search handler สำหรับ Binary Tree (BFS)
 *
 * วางไฟล์นี้ที่: src/hooks/BinaryTree/useBTSearchHandler.ts
 */

import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/AVLtree/insertAnimation';
import { searchBT, calculateBTPositions, btToReactFlow, type BTNode } from '@/src/components/visualizer/algorithmsTree/BinaryTree/binaryTree';

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

export function useBTSearchHandler({
  btRoot,
  setNodes,
  setEdges,
  setDescription,
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

      // animate ทีละ node ตาม BFS path
      path.forEach((id, idx) => {
        controller.scheduleStep(() => {
          const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(root, [], [], positions);
          const visited = new Set(path.slice(0, idx));

          const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === id || visited.has(n.id),
              highlightColor:
                n.id === id ? 'blue'
                  : visited.has(n.id) ? 'yellow' // mark visited as yellow instead of green while travelling
                    : undefined,
            },
          }));

          const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => {
            // Find if this edge connects two visited nodes or the current node
            const isHighlightedEdge = path.slice(0, idx + 1).includes(e.source) && path.slice(0, idx + 1).includes(e.target);
            return {
              ...e,
              style: isHighlightedEdge
                ? { stroke: '#F7AD45', strokeWidth: 3 }
                : { stroke: '#999', strokeWidth: 2 },
            };
          });

          setNodes(highlighted);
          setEdges(highlightedEdges);
          setDescription(`Searching... visiting node (step ${idx + 1}/${path.length})`);
        }, animationSpeed * (idx + 1));
      });

      // แสดงผลลัพธ์
      controller.scheduleStep(() => {
        const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(root, [], [], positions);
        if (found && nodeId) {
          const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === nodeId,
              highlightColor: n.id === nodeId ? 'green' : undefined,
            },
          }));
          setNodes(highlighted);
          setDescription(`✓ Found ${value}!`);
        } else {
          setNodes(rfNodes as RFNode[]);
          setDescription(`✗ ${value} not found`);
        }
        setEdges(rfEdges as RFEdge[]);

        controller.scheduleStep(() => {
          const { nodes: clean, edges: cleanE } = btToReactFlow(root, [], [], positions);
          setNodes(clean as RFNode[]);
          setEdges(cleanE as RFEdge[]);
          setDescription('');
        }, animationSpeed * 2);
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
