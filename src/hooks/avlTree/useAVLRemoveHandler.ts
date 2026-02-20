import { useCallback, MutableRefObject } from "react";
import { animateRemove, animateRemoveWithStructureCheck } from "@/src/components/visualizer/animations/AVLtree/removeAnimation";
import { animateSearch } from "@/src/components/visualizer/animations/AVLtree/searchAnimation";
import { AnimationController } from "@/src/components/visualizer/animations/Tree/animationController";
import { AVLTreeNode, avlTreeToReactFlow, calculateTreePositions } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import { rebuildAVLTreeFromNodes } from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";

const nodeExists = (root: AVLTreeNode | null, val: number): boolean => {
    if (!root) return false;
    if (root.value === val) return true;
    return val < root.value
        ? nodeExists(root.left, val)
        : nodeExists(root.right, val);
};

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

        const rfNodes = rf?.getNodes?.() || [];
        const latestRoot = rebuildAVLTreeFromNodes(rfNodes);

        if (!latestRoot) {
            setIsAnimating(false);
            setRemoveValue("");
            return;
        }

        const found = nodeExists(latestRoot, value);

        const positions = calculateTreePositions(latestRoot);
        const rfData = avlTreeToReactFlow(latestRoot, [], [], positions);
        const currentRFNodes = rfData.nodes;
        const currentRFEdges = rfData.edges;

        animateSearch(
            latestRoot,
            value,
            currentRFNodes,
            currentRFEdges,
            animationSpeed,
            controller,
            animationCallbacks,
            () => {
                if (!found) {
                    animationCallbacks.setDescription(`Node ${value} not found!`);
                    setTimeout(() => {
                        animationCallbacks.setDescription("");
                        setIsAnimating(false);
                        setRemoveValue("");
                    }, animationSpeed * 2);
                    return;
                }

                const freshRFNodes = rf?.getNodes?.() || currentRFNodes;
                const redNodes = freshRFNodes.map((n: any) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: String(n.data?.label) === String(value),
                        highlightColor: String(n.data?.label) === String(value) ? 'red' : undefined,
                    }
                }));

                animationCallbacks.setNodes(redNodes);
                animationCallbacks.setDescription(`Found ${value}! Removing...`);

                setTimeout(() => {
                    const freshRoot = rebuildAVLTreeFromNodes(freshRFNodes) || latestRoot;
                    animateRemoveWithStructureCheck(  
                        freshRoot,
                        value,
                        freshRFNodes,
                        animationSpeed,
                        controller,
                        animationCallbacks,
                        () => {
                            setIsAnimating(false);
                            setRemoveValue("");
                        }
                    );
                }, animationSpeed * 2);
            }
        );
    }, [
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setRemoveValue
    ]);

    return handleAVLRemove;
}