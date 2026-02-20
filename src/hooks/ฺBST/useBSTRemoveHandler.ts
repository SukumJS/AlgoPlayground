import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/AVLtree/insertAnimation';
import {
  removeBST,
  searchBST,
  calculateBSTPositions,
  bstToReactFlow,
  type BSTNode,
} from '@/src/components/visualizer/algorithmsTree/BST/bstTree';
import { animateBSTRemove } from '@/src/components/visualizer/animations/BST/removeAnimation';

interface UseBSTRemoveHandlerProps {
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

export function useBSTRemoveHandler({
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
}: UseBSTRemoveHandlerProps) {
  const controllerRef = useRef<AnimationController | null>(null);

  const handleRemove = useCallback(
    (value: number) => {
      controllerRef.current?.clearAll();
      const controller = new AnimationController(isPausedRef);
      controllerRef.current = controller;

      const { found } = searchBST(bstRoot, value);
      if (!found) {
        setDescription(`Value ${value} not found in tree`);
        return;
      }

      const callbacks: AnimationCallbacks = {
        setNodes,
        setEdges,
        setDescription,
        applyHighlighting,
      };

      animateBSTRemove(
        bstRoot,
        value,
        nodes,
        animationSpeed,
        controller,
        callbacks,
        () => {
          // อัปเดต root หลัง animation เสร็จ
          const newRoot = removeBST(bstRoot, value);
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

  return { handleRemove, cancelAnimation };
}
