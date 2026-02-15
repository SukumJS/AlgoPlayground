import { useCallback, MutableRefObject } from "react";
import type { AVLTreeNode } from "@/src/components/algorithms/AVLtree/avlTree";
import { findInsertionPosition } from "@/src/hooks/treeAdapters/avlAdapter";
import { animateRootInsertion } from "@/src/components/algorithms/AVLtree/index";
import { animateNonRootInsertion } from "@/src/components/algorithms/AVLtree/index";
import { AnimationController } from "@/src/components/algorithms/AVLtree/animationController";

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
        avlRoot,
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
            const currentRoot = avlRoot;

            const insertionPos = findInsertionPosition(currentRoot, valueToInsert);

            // Duplicate check
            if (
                currentRoot !== null &&
                insertionPos.parentId === null &&
                currentRoot.value === valueToInsert
            ) {
                setIsAnimating(false);
                setAnimationDescription(`⚠️ Value ${valueToInsert} already exists!`);
                setTimeout(() => setAnimationDescription(""), 2000);
                return;
            }

            const newNodeId = `avl_${nodeIdCounter}`;

            // Empty tree → root insert
            if (!currentRoot) {
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

            // Non-empty tree
            const currentRFNodes = rf?.getNodes?.() || [];
            const currentRFEdges = rf?.getEdges?.() || [];

            animateNonRootInsertion(
                currentRoot,
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
        avlRoot,
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