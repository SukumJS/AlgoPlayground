import { useCallback, useRef } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/types';
import {
    searchBST,
    calculateBSTPositions,
    bstToReactFlow,
    type BSTNode,
} from '@/src/components/visualizer/algorithmsTree/bstTree';

interface UseBSTSearchHandlerProps {
    bstRoot: BSTNode | null;
    setNodes: (nodes: any) => void;
    setEdges: (edges: any) => void;
    setDescription: (desc: string) => void;
    animationSpeed: number;
    isPausedRef: React.MutableRefObject<boolean>;
}

export function useBSTSearchHandler({
    bstRoot,
    setNodes,
    setEdges,
    setDescription,
    animationSpeed,
    isPausedRef,
}: UseBSTSearchHandlerProps) {
    const controllerRef = useRef<AnimationController | null>(null);
    const bstRootRef = useRef<BSTNode | null>(bstRoot);
    bstRootRef.current = bstRoot;

    const handleSearch = useCallback(
        (value: number) => {
            controllerRef.current?.clearAll();
            const controller = new AnimationController(isPausedRef);
            controllerRef.current = controller;

            const root = bstRootRef.current;
            if (!root) {
                setDescription('Tree is empty');
                controller.scheduleStep(() => setDescription(''), animationSpeed * 2); // Keep for 2 seconds
            }

            // Pre-compute
            const { found, nodeId, path } = searchBST(root, value);
            const positions = calculateBSTPositions(root);
            const rfData = bstToReactFlow(root, [], [], positions);
            const rfNodes = rfData.nodes as RFNode[];
            const rfEdges = rfData.edges as RFEdge[];

            let globalOffset = 0;

            // Step 1: Animate traversal
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
                    const currentNode = rfNodes.find(n => n.id === id); // Find current node for description
                    setDescription(`Searching for ${value}. Comparing with node ${currentNode?.data.label}.`);
                }, animationSpeed * globalOffset);

                globalOffset++; // Increment offset for the pause after description
                controller.scheduleStep(() => {
                    // Keep description visible for a short duration
                    // No visual change, just a pause
                }, animationSpeed * globalOffset);
            });
            // Step 2: Show result
            controller.scheduleStep(() => {
                if (found && nodeId) {
                    const highlighted = rfNodes.map((n: RFNode) => ({
                        ...n,
                        data: {
                            ...n.data,
                            isHighlighted: n.id === nodeId,
                            highlightColor: n.id === nodeId ? '#4CAF7D' : undefined,
                        },
                    }));
                    setNodes(highlighted);
                    setDescription(`Found ${value}!`);
                } else {
                    setNodes(rfNodes);
                    setDescription(`${value} was not found in the tree.`);
                }
                setEdges(rfEdges);

                // Step 3: Clean up
                // Keep the result visible for a moment before clearing highlights and text.
                controller.scheduleStep(() => {
                    setNodes(rfNodes);
                    setEdges(rfEdges);
                    setDescription('');
                }, animationSpeed * 4);
            }, animationSpeed * (globalOffset + 1));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [animationSpeed, isPausedRef, setNodes, setEdges, setDescription]
    );

    const cancelAnimation = useCallback(() => {
        controllerRef.current?.clearAll();
    }, []);

    return { handleSearch, cancelAnimation };
}
