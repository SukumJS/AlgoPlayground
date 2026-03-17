import { useCallback, useRef, useEffect } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import type { AnimationCallbacks } from "@/src/components/visualizer/animations/types";
import { type BTNode } from "@/src/components/visualizer/algorithmsTree/binaryTree";
import {
  animateBTInorder,
  animateBTPreorder,
  animateBTPostorder,
} from "@/src/components/visualizer/animations/BinaryTree/btTraversalAnimation";

interface UseBTTraversalHandlerProps {
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
  setIsAnimating: (val: boolean) => void;
}

export function useBTTraversalHandler({
  btRoot,
  setNodes,
  setEdges,
  setDescription,
  applyHighlighting,
  setCodeStep,
  setStepToCodeLine,
  setTreeAction,
  animationSpeed,
  isPausedRef,
  setIsAnimating,
}: UseBTTraversalHandlerProps) {
  const controllerRef = useRef<AnimationController | null>(null);
  const btRootRef = useRef<BTNode | null>(btRoot);
  useEffect(() => {
    btRootRef.current = btRoot;
  }, [btRoot]);

  const runTraversal = useCallback(
    (type: "inorder" | "preorder" | "postorder") => {
      controllerRef.current?.clearAll();
      const controller = new AnimationController(isPausedRef);
      controllerRef.current = controller;
      setIsAnimating(true);

      const callbacks: AnimationCallbacks = {
        setNodes,
        setEdges,
        setDescription,
        setCodeStep,
        setStepToCodeLine,
        setTreeAction,
        applyHighlighting,
      };

      const root = btRootRef.current;
      const done = () => setIsAnimating(false);

      if (type === "inorder")
        animateBTInorder(root, animationSpeed, controller, callbacks, done);
      else if (type === "preorder")
        animateBTPreorder(root, animationSpeed, controller, callbacks, done);
      else
        animateBTPostorder(root, animationSpeed, controller, callbacks, done);
    },
    [
      animationSpeed,
      isPausedRef,
      setNodes,
      setEdges,
      setDescription,
      setIsAnimating,
      applyHighlighting,
      setCodeStep,
      setStepToCodeLine,
      setTreeAction,
      btRootRef,
    ],
  );

  const handleInorder = useCallback(
    () => runTraversal("inorder"),
    [runTraversal],
  );
  const handlePreorder = useCallback(
    () => runTraversal("preorder"),
    [runTraversal],
  );
  const handlePostorder = useCallback(
    () => runTraversal("postorder"),
    [runTraversal],
  );
  const cancelAnimation = useCallback(() => {
    controllerRef.current?.clearAll();
    setIsAnimating(false);
  }, [setIsAnimating]);

  return { handleInorder, handlePreorder, handlePostorder, cancelAnimation };
}
