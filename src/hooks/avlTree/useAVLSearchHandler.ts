import { useCallback, MutableRefObject } from "react";
import { avlTreeToReactFlow, calculateTreePositions, type AVLTreeNode } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import { animateSearch } from "@/src/components/visualizer/animations/AVLtree/searchAnimation";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";

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

        let currentRFNodes: any[] = [];
        let currentRFEdges: any[] = [];

        if (avlRoot) {
            const positions = calculateTreePositions(avlRoot);
            const rfData = avlTreeToReactFlow(avlRoot, [], [], positions);
            currentRFNodes = rfData.nodes;
            currentRFEdges = rfData.edges;
        }

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
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setSearchValue
    ]);

    return handleAVLSearch;
}