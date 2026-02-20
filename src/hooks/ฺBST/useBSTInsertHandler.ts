import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/AVLtree/insertAnimation';
import {
  insertBST,
  findBSTInsertionPosition,
  calculateBSTPositions,
  bstToReactFlow,
  type BSTNode,
} from '@/src/components/visualizer/algorithmsTree/BST/bstTree';
import { animateBSTInsert } from '@/src/components/visualizer/animations/BST/insertAnimation';

interface UseBSTInsertHandlerProps {
  bstRoot: BSTNode | null;
  setBSTRoot: (root: BSTNode | null) => void;
  nodes: RFNode[];
  edges: RFEdge[];
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
  setDescription: (desc: string) => void;
  applyHighlighting: AnimationCallbacks['applyHighlighting'];
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
}

export function useBSTInsertHandler({
  bstRoot,
  setBSTRoot,
  nodes,
  edges,
  setNodes,
  setEdges,
  setDescription,
  applyHighlighting,
  animationSpeed,
  isPausedRef,
}: UseBSTInsertHandlerProps) {
  const controllerRef = useRef<AnimationController | null>(null);

  const handleInsert = useCallback(
    (value: number) => {
      // ยกเลิก animation เดิม
      controllerRef.current?.clearAll();
      const controller = new AnimationController(isPausedRef);
      controllerRef.current = controller;

      const newNodeId = `bst-node-${Date.now()}`;

      const callbacks: AnimationCallbacks = {
        setNodes,
        setEdges,
        setDescription,
        applyHighlighting,
      };

      animateBSTInsert(
        bstRoot,
        value,
        newNodeId,
        nodes,
        animationSpeed,
        controller,
        callbacks,
        () => {
          // อัปเดต root หลัง animation เสร็จ
          const newRoot = insertBST(bstRoot, value, newNodeId);
          setBSTRoot(newRoot);

          // sync ReactFlow nodes/edges
          const positions = calculateBSTPositions(newRoot);
          const { nodes: finalNodes, edges: finalEdges } = bstToReactFlow(newRoot, [], [], positions);
          setNodes(finalNodes);
          setEdges(finalEdges);
        }
      );
    },
    [bstRoot, setBSTRoot, nodes, animationSpeed, isPausedRef, setNodes, setEdges, setDescription, applyHighlighting]
  );

  const cancelAnimation = useCallback(() => {
    controllerRef.current?.clearAll();
  }, []);

  return { handleInsert, cancelAnimation };
}
