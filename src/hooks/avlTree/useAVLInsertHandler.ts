import { useCallback, MutableRefObject } from "react";
import type { AVLTreeNode } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import {
    findInsertionPosition,
    rebuildAVLTreeFromNodes
} from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import {
    animateRootInsertion,
    animateNonRootInsertion
} from "@/src/components/visualizer/animations/AVLtree/insertAnimation";

import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";

/**
 * Hook: AVL Insert Handler
 * Handles animated AVL insertion for visualizer
 */
export function useAVLInsertHandler(params: {
    avlRoot: AVLTreeNode | null;
    nodeIdCounter: number;
    animationSpeed: number;
    rf: any;
    animationCallbacks: any;
    isPausedRef: MutableRefObject<boolean>;
    setIsAnimating: (v: boolean) => void;
    setAnimationDescription: (v: string) => void;
    setNodeIdCounter: React.Dispatch<React.SetStateAction<number>>;
}) {
    const {
        nodeIdCounter,
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setAnimationDescription,
        setNodeIdCounter
    } = params;

    const handleAVLInsert = useCallback((valueToInsert: number) => {
        const controller = new AnimationController(isPausedRef);

        setIsAnimating(true);
        setAnimationDescription(`Finding position for value ${valueToInsert}...`);

        setTimeout(() => {
            const rfNodes = rf?.getNodes?.() || [];
            const latestRoot = rebuildAVLTreeFromNodes(rfNodes);

            const insertionPos = findInsertionPosition(latestRoot, valueToInsert);

            if (
                latestRoot &&
                insertionPos.parentId === null &&
                latestRoot.value === valueToInsert
            ) {
                setIsAnimating(false);
                setAnimationDescription(`⚠️ Value ${valueToInsert} already exists!`);
                setTimeout(() => setAnimationDescription(""), 2000);
                return;
            }

            const newNodeId = `avl_${nodeIdCounter}`;

            /** Empty tree → root */
            if (!latestRoot) {
                animateRootInsertion(
                    valueToInsert,
                    newNodeId,
                    animationSpeed,
                    controller,
                    animationCallbacks,
                    () => {
                        setNodeIdCounter(prev => prev + 1);
                        setIsAnimating(false);
                    }
                );
                return;
            }

            /** Non-root insert */
            const currentRFNodes = rf?.getNodes?.() || [];
            const currentRFEdges = rf?.getEdges?.() || [];

            animateNonRootInsertion(
                latestRoot,
                valueToInsert,
                newNodeId,
                insertionPos.path || [],
                insertionPos.parentId,
                insertionPos.parentValue ?? undefined,
                insertionPos.position,
                currentRFNodes,
                currentRFEdges,
                animationSpeed,
                controller,
                animationCallbacks,
                () => {
                    setNodeIdCounter(prev => prev + 1);
                    setIsAnimating(false);
                }
            );
        }, 150);
    }, [
        nodeIdCounter,
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setAnimationDescription,
        setNodeIdCounter
    ]);

    return handleAVLInsert;
}
