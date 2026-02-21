import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/types';
import { removeBT, searchBT, calculateBTPositions, btToReactFlow, type BTNode } from '@/src/components/visualizer/algorithmsTree/BinaryTree/binaryTree';

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

      // animate: สร้าง BFS path ก่อน remove เพื่อโชว์ว่าหานั้นอย่างไร
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

      let globalOffset = 0;
      if (root && searchPath.length > 0) {
        searchPath.forEach((id, idx) => {
          controller.scheduleStep(() => {
            const positions = calculateBTPositions(root);
            const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(root, [], [], positions, 'bt-edge');

            const highlightedNodes = (rfNodes as RFNode[]).map((n: RFNode) => ({
              ...n,
              data: {
                ...n.data,
                isHighlighted: n.id === id,
                highlightColor: n.id === id ? '#62A2F7' : undefined,
              },
            }));

            const highlightedEdges = (rfEdges as RFEdge[]).map((e: RFEdge) => {
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
            setDescription(`Searching for ${value}... visiting node ${id}`);
          }, animationSpeed * (idx + 1));
          globalOffset = idx + 1;
        });
      }

      // highlight node ที่จะลบ
      globalOffset++;
      controller.scheduleStep(() => {
        const positions = calculateBTPositions(root);
        const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(root, [], [], positions, 'bt-edge');
        const highlighted = (rfNodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === nodeId,
            highlightColor: n.id === nodeId ? '#EF4444' : undefined,
          },
        }));
        setNodes(highlighted);
        setEdges(rfEdges as RFEdge[]);
        setDescription(`Found ${value}! Removing...`);
      }, animationSpeed * globalOffset);

      // ลบและแสดง tree ใหม่
      globalOffset++;
      controller.scheduleStep(() => {
        const newRoot = removeBT(root, value);
        setBTRoot(newRoot);

        const positions = calculateBTPositions(newRoot);
        const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(newRoot, [], [], positions);
        setNodes(rfNodes as RFNode[]);
        setEdges(rfEdges as RFEdge[]);
        setDescription(`Removed ${value}`);
      }, animationSpeed * globalOffset);

      // Clear description
      controller.scheduleStep(() => {
        setDescription('');
      }, animationSpeed * (globalOffset + 2));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationSpeed, isPausedRef, setBTRoot, setNodes, setEdges, setDescription]
  );

  const cancelAnimation = useCallback(() => {
    controllerRef.current?.clearAll();
  }, []);

  return { handleRemove, cancelAnimation };
}
