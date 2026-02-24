import { useCallback } from 'react';
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
    nodes: RFNode[];
    edges: RFEdge[];
    setNodes: (nodes: any) => void;
    setEdges: (edges: any) => void;
    setDescription: (desc: string) => void;
    applyHighlighting: AnimationCallbacks['applyHighlighting'];
    animationSpeed: number;
    isPausedRef: React.MutableRefObject<boolean>;
}

export function useBSTSearchHandler({
    bstRoot,
    nodes,
    edges,
    setNodes,
    setEdges,
    setDescription,
    applyHighlighting,
    animationSpeed,
    isPausedRef,
}: UseBSTSearchHandlerProps) {
    const handleSearch = useCallback(
        (value: number) => {
            const controller = new AnimationController(isPausedRef);

            if (!bstRoot) {
                setDescription('Tree is empty');
                return;
            }

            // Pre-compute
            const { found, nodeId, path } = searchBST(bstRoot, value);
            const positions = calculateBSTPositions(bstRoot);
            const rfData = bstToReactFlow(bstRoot, [], [], positions);
            const rfNodes = rfData.nodes as RFNode[];
            const rfEdges = rfData.edges as RFEdge[];

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
                    setDescription(`Searching for ${value}...`);
                }, animationSpeed * (idx + 1));
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
                    setDescription(`✓ Found ${value}!`);
                } else {
                    setNodes(rfNodes);
                    setDescription(`✗ ${value} not found`);
                }
                setEdges(rfEdges);

                // Step 3: Clean up
                controller.scheduleStep(() => {
                    setNodes(rfNodes);
                    setEdges(rfEdges);
                    setDescription('');
                }, animationSpeed * 2);
            }, animationSpeed * (path.length + 1));
        },
        [bstRoot, nodes, animationSpeed, isPausedRef, setNodes, setEdges, setDescription, applyHighlighting]
    );

    const cancelAnimation = useCallback(() => { }, []);

    return { handleSearch, cancelAnimation };
}
