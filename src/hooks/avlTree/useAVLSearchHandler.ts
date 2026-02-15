import { useCallback, MutableRefObject } from "react";
import type { AVLTreeNode } from "@/src/components/algorithms/AVLtree/avlTree";
import { animateSearch } from "@/src/components/algorithms/AVLtree/searchAnimation";
import { AnimationController } from "@/src/components/algorithms/AVLtree/index";

export function useAVLSearchHandler(params: {
    avlRoot: AVLTreeNode | null;
    animationSpeed: number;
    rf: any;
    animationCallbacks: any;
    isPausedRef: MutableRefObject<boolean>;
    setIsAnimating: (v: boolean) => void;
    setSearchValue: (v: string) => void;
}) {
    const {
        avlRoot,
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setSearchValue
    } = params;

    const handleAVLSearch = useCallback((value: number) => {
        const controller = new AnimationController(isPausedRef);
        setIsAnimating(true);

        const currentRFNodes = rf?.getNodes?.() || [];
        const currentRFEdges = rf?.getEdges?.() || [];

        animateSearch(
            avlRoot,
            value,
            currentRFNodes,
            currentRFEdges,
            animationSpeed,
            controller,
            animationCallbacks,
            () => {
                setIsAnimating(false);
                setSearchValue("");
            }
        );
    }, [
        avlRoot,
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setSearchValue
    ]);

    return handleAVLSearch;
}