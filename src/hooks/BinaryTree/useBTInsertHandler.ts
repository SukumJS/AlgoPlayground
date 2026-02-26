import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/types';
import { insertBT, calculateBTPositions, btToReactFlow, type BTNode } from '@/src/components/visualizer/algorithmsTree/binaryTree';

interface UseBTInsertHandlerProps {
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

export function useBTInsertHandler({
  btRoot,
  setBTRoot,
  setNodes,
  setEdges,
  setDescription,
  applyHighlighting,
  animationSpeed,
  isPausedRef,
}: UseBTInsertHandlerProps) {
  const controllerRef = useRef<AnimationController | null>(null);
  const btRootRef = useRef<BTNode | null>(btRoot);
  btRootRef.current = btRoot;

  const handleInsert = useCallback(
    (value: number) => {
      controllerRef.current?.clearAll();
      const controller = new AnimationController(isPausedRef);
      controllerRef.current = controller;

      const newNodeId = `bt-node-${Date.now()}`;
      const rootAtInsertTime = btRootRef.current;

      // animate: สร้าง BFS path ก่อน insert เพื่อโชว์ว่าหาที่ว่างอย่างไร
      const searchPath: string[] = [];
      const edgePath: string[] = [];
      let parentId: string | null = null;
      let parentDir: 'left' | 'right' | null = null;

      if (rootAtInsertTime) {
        const queue: BTNode[] = [rootAtInsertTime];
        while (queue.length > 0) {
          const cur = queue.shift()!;
          searchPath.push(cur.id);
          if (!cur.left) { parentId = cur.id; parentDir = 'left'; break; }
          queue.push(cur.left);
          edgePath.push(`bt-edge-${cur.id}-${cur.left.id}`);

          if (!cur.right) { parentId = cur.id; parentDir = 'right'; break; }
          queue.push(cur.right);
          edgePath.push(`bt-edge-${cur.id}-${cur.right.id}`);
        }
      }

      // Step 1: Animate Traversal (Blue nodes, Orange edges)
      let globalOffset = 0;
      if (rootAtInsertTime && searchPath.length > 0) {
        searchPath.forEach((id, idx) => {
          controller.scheduleStep(() => {
            const positions = calculateBTPositions(rootAtInsertTime);
            const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(rootAtInsertTime, [], [], positions, 'bt-edge');

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
            const currentNode = (rfNodes as RFNode[]).find(n => n.id === id);
            setDescription(`Finding an empty spot... checking node ${currentNode?.data.label}.`);
          }, animationSpeed * (idx + 1));
          globalOffset = idx + 1;
        });
      }

      // Step 2: Highlight Parent (Yellow)
      if (parentId) {
        globalOffset++;
        controller.scheduleStep(() => {
          const positions = calculateBTPositions(rootAtInsertTime);
          const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(rootAtInsertTime, [], [], positions, 'bt-edge');

          const highlightedNodes = (rfNodes as RFNode[]).map((n: RFNode) => ({
            ...n,
            data: {
              ...n.data,
              isHighlighted: n.id === parentId,
              highlightColor: n.id === parentId ? '#F7AD45' : undefined,
            },
          }));
          setNodes(highlightedNodes);
          setEdges(rfEdges as RFEdge[]);
          const parentNode = (rfNodes as RFNode[]).find(n => n.id === parentId); // Find parent node for description
          setDescription(`Found an empty spot as the ${parentDir} child of node ${parentNode?.data.label}.`);
        }, animationSpeed * globalOffset);
        globalOffset++; // Pause after description
        controller.scheduleStep(() => {}, animationSpeed * globalOffset);
      }

      // Step 3: Insert & return to green
      globalOffset++;
      controller.scheduleStep(() => {
        // จริงๆ insert ตรงนี้เพื่อให้ UI เปลี่ยน
        const newRoot = insertBT(rootAtInsertTime, value, newNodeId);
        setBTRoot(newRoot);

        const positions = calculateBTPositions(newRoot);
        const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(newRoot, [], [], positions, 'bt-edge');

        const highlightedNodes = (rfNodes as RFNode[]).map((n: RFNode) => ({
          ...n,
          data: {
            ...n.data,
            isHighlighted: n.id === newNodeId,
            highlightColor: n.id === newNodeId ? '#4CAF7D' : undefined,
          },
        }));

        setNodes(highlightedNodes);
        setEdges(rfEdges as RFEdge[]);
        setDescription(`Inserted ${value} into the next available spot.`);

        // clear highlight
        controller.scheduleStep(() => {
          const finalPositions = calculateBTPositions(newRoot);
          const { nodes: finalNodes, edges: finalEdges } = btToReactFlow(newRoot, [], [], finalPositions, 'bt-edge');
          setNodes(finalNodes as RFNode[]);
          setEdges(finalEdges as RFEdge[]);
          setDescription('');
        }, animationSpeed * 4); // Longer delay for final state
      }, animationSpeed * globalOffset);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationSpeed, isPausedRef, setBTRoot, setNodes, setEdges, setDescription]
  );

  const cancelAnimation = useCallback(() => {
    controllerRef.current?.clearAll();
  }, []);

  return { handleInsert, cancelAnimation };
}
