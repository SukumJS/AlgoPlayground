import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/types';
import { type BTNode } from '@/src/components/visualizer/algorithmsTree/BinaryTree/binaryTree';
import {
  animateBTInorder,
  animateBTPreorder,
  animateBTPostorder,
} from '@/src/components/visualizer/animations/BinaryTree/btTraversalAnimation';

interface UseBTTraversalHandlerProps {
  btRoot: BTNode | null;
  nodes: RFNode[];
  edges: RFEdge[];
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  applyHighlighting: AnimationCallbacks['applyHighlighting'];
  animationSpeed: number;
  isPausedRef: React.MutableRefObject<boolean>;
  setIsAnimating: (val: boolean) => void;
}

export function useBTTraversalHandler({
  btRoot,
  setNodes,
  setEdges,
  setDescription,
  applyHighlighting,
  animationSpeed,
  isPausedRef,
  setIsAnimating,
}: UseBTTraversalHandlerProps) {
  const controllerRef = useRef<AnimationController | null>(null);
  const btRootRef = useRef<BTNode | null>(btRoot);
  btRootRef.current = btRoot;

  const runTraversal = useCallback(
    (type: 'inorder' | 'preorder' | 'postorder') => {
      controllerRef.current?.clearAll();
      const controller = new AnimationController(isPausedRef);
      controllerRef.current = controller;
      setIsAnimating(true);

      const callbacks: AnimationCallbacks = {
        setNodes,
        setEdges,
        setDescription,
        applyHighlighting,
      };

      const root = btRootRef.current;
      const done = () => setIsAnimating(false);

      if (type === 'inorder') animateBTInorder(root, animationSpeed, controller, callbacks, done);
      else if (type === 'preorder') animateBTPreorder(root, animationSpeed, controller, callbacks, done);
      else animateBTPostorder(root, animationSpeed, controller, callbacks, done);
    },
    [animationSpeed, isPausedRef, setNodes, setEdges, setDescription, applyHighlighting, setIsAnimating]
  );

  const handleInorder = useCallback(() => runTraversal('inorder'), [runTraversal]);
  const handlePreorder = useCallback(() => runTraversal('preorder'), [runTraversal]);
  const handlePostorder = useCallback(() => runTraversal('postorder'), [runTraversal]);
  const cancelAnimation = useCallback(() => {
    controllerRef.current?.clearAll();
    setIsAnimating(false);
  }, [setIsAnimating]);

  return { handleInorder, handlePreorder, handlePostorder, cancelAnimation };
}
