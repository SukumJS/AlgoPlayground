import { useCallback } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/types';
import {
    removeBST,
    searchBST,
    calculateBSTPositions,
    bstToReactFlow,
    cloneBSTTree,
    type BSTNode,
} from '@/src/components/visualizer/algorithmsTree/BST/bstTree';

interface UseBSTRemoveHandlerProps {
    bstRoot: BSTNode | null;
    setBSTRoot: (root: BSTNode | null) => void;
    nodes: RFNode[];
    edges: RFEdge[];
    setNodes: (nodes: any) => void;
    setEdges: (edges: any) => void;
    setDescription: (desc: string) => void;
    applyHighlighting: AnimationCallbacks['applyHighlighting'];
    animationSpeed: number;
    isPausedRef: React.MutableRefObject<boolean>;
}

export function useBSTRemoveHandler({
    bstRoot,
    setBSTRoot,
    nodes,
    edges,
    setNodes,
    setEdges,
    setDescription,
    applyHighlighting,
    animationSpeed,
    isPausedRef,
}: UseBSTRemoveHandlerProps) {
    const handleRemove = useCallback(
        (value: number) => {
            const controller = new AnimationController(isPausedRef);

            if (!bstRoot) {
                setDescription('Tree is empty');
                return;
            }

            // Pre-compute search path
            const { found, nodeId, path } = searchBST(bstRoot, value);
            const positions = calculateBSTPositions(bstRoot);
            const rfData = bstToReactFlow(bstRoot, [], [], positions);
            const rfNodes = rfData.nodes as RFNode[];
            const rfEdges = rfData.edges as RFEdge[];

            let globalOffset = 0;

            // Step 1: Animate search traversal
            path.forEach((id, idx) => {
                controller.scheduleStep(() => {
                    const highlighted = rfNodes.map((n: RFNode) => ({
                        ...n,
                        data: {
                            ...n.data,
                            isHighlighted: n.id === id,
                            highlightColor: n.id === id ? '#62A2F7' : undefined,
                        },
                    }));
                    const highlightedEdges = rfEdges.map((e: RFEdge) => {
                        const visitedIds = new Set(path.slice(0, idx + 1));
                        const isEdgeHighlighted = visitedIds.has(e.source) && visitedIds.has(e.target);
                        return {
                            ...e,
                            style: isEdgeHighlighted
                                ? { stroke: '#F7AD45', strokeWidth: 3 }
                                : { stroke: '#999', strokeWidth: 2 },
                        };
                    });
                    setNodes(highlighted);
                    setEdges(highlightedEdges);
                    setDescription(`Searching for ${value}...`);
                }, animationSpeed * (idx + 1));
                globalOffset = idx + 1;
            });

            // Step 2: Not found
            if (!found) {
                globalOffset++;
                controller.scheduleStep(() => {
                    setNodes(rfNodes);
                    setEdges(rfEdges);
                    setDescription(`✗ ${value} not found`);
                    controller.scheduleStep(() => setDescription(''), animationSpeed * 2);
                }, animationSpeed * globalOffset);
                return;
            }

            // Step 3: Highlight found node in red
            globalOffset++;
            controller.scheduleStep(() => {
                const highlighted = rfNodes.map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === nodeId,
                        highlightColor: n.id === nodeId ? '#EF4444' : undefined,
                    },
                }));
                setNodes(highlighted);
                setEdges(rfEdges);
                setDescription(`Found ${value}! Removing...`);
            }, animationSpeed * globalOffset);

            // Step 4: Show result after removal (snap to new positions)
            globalOffset++;
            controller.scheduleStep(() => {
                const rootCopy = cloneBSTTree(bstRoot);
                const newRoot = removeBST(rootCopy, value);
                setBSTRoot(newRoot);

                if (newRoot) {
                    const newPositions = calculateBSTPositions(newRoot);
                    const newRF = bstToReactFlow(newRoot, [], [], newPositions);
                    setNodes(newRF.nodes as RFNode[]);
                    setEdges(newRF.edges as RFEdge[]);
                } else {
                    setNodes([]);
                    setEdges([]);
                }
                setDescription(`Removed ${value}.`);

                controller.scheduleStep(() => setDescription(''), animationSpeed * 2);
            }, animationSpeed * globalOffset);
        },
        [bstRoot, setBSTRoot, nodes, animationSpeed, isPausedRef, setNodes, setEdges, setDescription, applyHighlighting]
    );

    const cancelAnimation = useCallback(() => { }, []);

    return { handleRemove, cancelAnimation };
}
