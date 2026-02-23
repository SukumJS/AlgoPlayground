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
    findBSTSuccessor,
    type BSTNode,
} from '@/src/components/visualizer/algorithmsTree/bstTree';

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

            // Pre-compute search path and tree states
            const { found, nodeId, path } = searchBST(bstRoot, value);
            const { successorId } = findBSTSuccessor(bstRoot, value);

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
                setDescription(`❌ Found ${value}! Removing...`);
            }, animationSpeed * globalOffset);

            // Step 4: Highlight inorder successor if it exists
            if (successorId) {
                globalOffset++;
                controller.scheduleStep(() => {
                    const highlighted = rfNodes.map((n: RFNode) => ({
                        ...n,
                        data: {
                            ...n.data,
                            isHighlighted: n.id === nodeId || n.id === successorId,
                            highlightColor: n.id === nodeId ? '#EF4444' : (n.id === successorId ? '#F7AD45' : undefined),
                        },
                    }));
                    setNodes(highlighted);
                    setEdges(rfEdges);
                    setDescription(`🔄 Found inorder successor — will replace deleted node`);
                }, animationSpeed * globalOffset);
            }

            // Step 5: Perform Removal and Animate Structural Shift
            const rootCopy = cloneBSTTree(bstRoot);
            const newRoot = removeBST(rootCopy, value);

            if (newRoot) {
                const finalPositions = calculateBSTPositions(newRoot);
                const finalRF = bstToReactFlow(newRoot, [], [], finalPositions);

                // Build position maps: before-removal → after-removal
                const beforePosMap = new Map<string, { x: number; y: number }>();
                (rfNodes as RFNode[]).forEach(n => {
                    // map by ID. Even if successor changes ID/Value, ReactFlow IDs remain consistent.
                    beforePosMap.set(n.id, { x: n.position.x, y: n.position.y });
                });
                const afterPosMap = new Map<string, { x: number; y: number }>();
                (finalRF.nodes as RFNode[]).forEach(n => {
                    afterPosMap.set(n.id, { x: n.position.x, y: n.position.y });
                });

                // Step 5a: Topology Re-wire
                globalOffset++;
                controller.scheduleStep(() => {
                    // Nodes stay in old positions, but use new edges
                    const tangledNodes = (finalRF.nodes as RFNode[]).map((n: RFNode) => {
                        // For the successor that replaced the deleted node, use the deleted node's old position
                        const beforePosId = (n.id === nodeId && successorId) ? successorId : n.id;
                        const before = beforePosMap.get(beforePosId) || n.position;
                        return {
                            ...n,
                            position: before,
                            data: {
                                ...n.data,
                                isHighlighted: n.id === nodeId, // The replacing node takes the deleted ID
                                highlightColor: n.id === nodeId ? '#F7AD45' : undefined,
                            },
                        };
                    });

                    // Highlight new edges connected to the replacement point
                    const hlEdges = (finalRF.edges as RFEdge[]).map((e: RFEdge) => ({
                        ...e,
                        style: (e.source === nodeId || e.target === nodeId)
                            ? { stroke: '#F7AD45', strokeWidth: 3 }
                            : { stroke: '#999', strokeWidth: 2 },
                    }));

                    setNodes(tangledNodes);
                    setEdges(hlEdges);
                    setDescription('🔗 Re-wiring tree structure...');
                }, animationSpeed * globalOffset);

                // Step 5b: Geometry Untangle (15 frames)
                const INTERP_FRAMES = 15;
                for (let frame = 1; frame <= INTERP_FRAMES; frame++) {
                    const t = frame / INTERP_FRAMES;
                    const fractionOffset = globalOffset + (frame / INTERP_FRAMES);

                    controller.scheduleStep(() => {
                        const interpolated = (finalRF.nodes as RFNode[]).map((n: RFNode) => {
                            const beforePosId = (n.id === nodeId && successorId) ? successorId : n.id;
                            const before = beforePosMap.get(beforePosId);
                            const after = afterPosMap.get(n.id);

                            let pos = n.position;
                            if (before && after) {
                                pos = {
                                    x: before.x + (after.x - before.x) * t,
                                    y: before.y + (after.y - before.y) * t,
                                };
                            }

                            return {
                                ...n,
                                position: pos,
                                data: {
                                    ...n.data,
                                    isHighlighted: n.id === nodeId,
                                    highlightColor: n.id === nodeId ? '#4CAF7D' : undefined,
                                },
                            };
                        });

                        setNodes(interpolated);
                        setEdges(finalRF.edges as RFEdge[]);
                        setDescription('✨ Structuring tree layout...');
                    }, animationSpeed * fractionOffset);
                }
                globalOffset++;

                // Step 5c: Final State Update
                globalOffset++;
                controller.scheduleStep(() => {
                    setBSTRoot(newRoot);
                    setNodes(finalRF.nodes as RFNode[]);
                    setEdges(finalRF.edges as RFEdge[]);
                    setDescription(`✅ Removed ${value}.`);
                    controller.scheduleStep(() => setDescription(''), animationSpeed * 2);
                }, animationSpeed * globalOffset);

            } else {
                // Tree is completely empty
                globalOffset++;
                controller.scheduleStep(() => {
                    setBSTRoot(null);
                    setNodes([]);
                    setEdges([]);
                    setDescription(`✅ Removed ${value}. Tree is empty.`);
                    controller.scheduleStep(() => setDescription(''), animationSpeed * 2);
                }, animationSpeed * globalOffset);
            }
        },
        [bstRoot, setBSTRoot, nodes, animationSpeed, isPausedRef, setNodes, setEdges, setDescription, applyHighlighting]
    );

    const cancelAnimation = useCallback(() => { }, []);

    return { handleRemove, cancelAnimation };
}
