import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/AVLtree/insertAnimation';
import {
  type BSTNode,
} from '@/src/components/visualizer/algorithmsTree/BST/bstTree';
import { animateBSTSearch } from '@/src/components/visualizer/animations/BST/searchAnimation';

interface UseBSTSearchHandlerProps {
  bstRoot: BSTNode | null;
  nodes: RFNode[];
  edges: RFEdge[];
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
  setDescription: (desc: string) => void;
  applyHighlighting: AnimationCallbacks['applyHighlighting'];
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
}

export function useBSTSearchHandler({
  bstRoot,
  nodes,
  edges,
  setNodes,
  setEdges,
  setDescription,
  applyHighlighting,
  animationSpeed,
  isPausedRef,
}: UseBSTSearchHandlerProps) {
  const controllerRef = useRef<AnimationController | null>(null);

  const handleSearch = useCallback(
    (value: number) => {
      controllerRef.current?.clearAll();
      const controller = new AnimationController(isPausedRef);
      controllerRef.current = controller;

      const callbacks: AnimationCallbacks = {
        setNodes,
        setEdges,
        setDescription,
        applyHighlighting,
      };

      animateBSTSearch(
        bstRoot,
        value,
        nodes,
        animationSpeed,
        controller,
        callbacks,
        () => {} // search ไม่ต้องอัปเดต state
      );
    },
    [bstRoot, nodes, animationSpeed, isPausedRef, setNodes, setEdges, setDescription, applyHighlighting]
  );

  const cancelAnimation = useCallback(() => {
    controllerRef.current?.clearAll();
  }, []);

  return { handleSearch, cancelAnimation };
}
