import { useCallback, MutableRefObject } from "react";
import { AnimationCallbacks } from "@/src/components/visualizer/animations/AVLtree/insertAnimation";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import { AVLTreeNode, avlTreeToReactFlow, calculateTreePositions } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import { rebuildAVLTreeFromNodes } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import { useReactFlow } from "@xyflow/react";

const INSTANT_SPEED = 1;

export function useAVLRebalanceFromTree(params: {
    avlRoot: AVLTreeNode | null;
    rf: ReturnType<typeof useReactFlow>;
    animationCallbacks: AnimationCallbacks;
    isPausedRef: React.MutableRefObject<boolean>;
    setIsAnimating: (v: boolean) => void;
}) {
    return useAVLRebalanceHandler(params);
}

export function useAVLRebalanceHandler(params: {
    avlRoot: AVLTreeNode | null;
    rf: any;
    animationCallbacks: any;
    isPausedRef: MutableRefObject<boolean>;
    setIsAnimating: (v: boolean) => void;
}) {
    const {
        avlRoot,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
    } = params;

    const handleAVLRebalance = useCallback(() => {
        setIsAnimating(true);

        const rfNodes = rf?.getNodes?.() || [];
        const latestRoot = rebuildAVLTreeFromNodes(rfNodes) || avlRoot;

        if (!latestRoot) {
            setIsAnimating(false);
            return;
        }

        const controller = new AnimationController(isPausedRef);

        animationCallbacks.setDescription("Rebalancing tree...");

        const positions = calculateTreePositions(latestRoot);
        const { nodes, edges } = avlTreeToReactFlow(latestRoot, [], [], positions);

        controller.scheduleStep(() => {
            animationCallbacks.setNodes(nodes);
            animationCallbacks.setEdges(edges);
            animationCallbacks.setDescription("Tree rebalanced!");
        }, INSTANT_SPEED);

        controller.scheduleStep(() => {
            animationCallbacks.setDescription("");
            setIsAnimating(false);
        }, INSTANT_SPEED * 2);

    }, [
        avlRoot,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
    ]);

    return handleAVLRebalance;
}