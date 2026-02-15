import { useCallback, MutableRefObject } from "react";
import { animateRemove } from "@/src/components/algorithms/AVLtree/removeAnimation";
import { AnimationController } from "@/src/components/algorithms/AVLtree/index";
import { AVLTreeNode } from "@/src/components/algorithms/AVLtree/avlTree";

export function useAVLRemoveHandler(params: {
    avlRoot: AVLTreeNode | null;
    animationSpeed: number;
    rf: any;
    animationCallbacks: any;
    isPausedRef: MutableRefObject<boolean>;
    setIsAnimating: (v: boolean) => void;
    setRemoveValue: (v: string) => void;
}) {
    const {
        avlRoot,
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setRemoveValue
    } = params;

    const handleAVLRemove = useCallback((value: number) => {
        const controller = new AnimationController(isPausedRef);
        setIsAnimating(true);

        const currentRFNodes = rf?.getNodes?.() || [];

        animateRemove(
            avlRoot,
            value,
            currentRFNodes,
            animationSpeed,
            controller,
            animationCallbacks,
            () => {
                setIsAnimating(false);
                setRemoveValue("");
            }
        );
    }, [
        avlRoot,
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setRemoveValue
    ]);

    return handleAVLRemove;
}