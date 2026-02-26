import { useCallback, useRef } from 'react';
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
    setNodes: (nodes: any) => void;
    setEdges: (edges: any) => void;
    setDescription: (desc: string) => void;
    animationSpeed: number;
    isPausedRef: React.MutableRefObject<boolean>;
}

export function useBSTRemoveHandler({
    bstRoot,
    setBSTRoot,
    setNodes,
    setEdges,
    setDescription,
    animationSpeed,
    isPausedRef,
}: UseBSTRemoveHandlerProps) {
    const controllerRef = useRef<AnimationController | null>(null);
    const bstRootRef = useRef<BSTNode | null>(bstRoot);
    bstRootRef.current = bstRoot;

    const handleRemove = useCallback(
        (value: number) => {
            controllerRef.current?.clearAll();
            const controller = new AnimationController(isPausedRef);
            controllerRef.current = controller;

            const root = bstRootRef.current;
            if (!root) {
                setDescription('Tree is empty');
                controller.scheduleStep(() => setDescription(''), animationSpeed * 2); // Keep for 2 seconds
            }

            // Pre-compute search path and tree states
            const { found, nodeId, path } = searchBST(root, value);
            const { successorId } = findBSTSuccessor(root, value);

            const positions = calculateBSTPositions(root);
            const rfData = bstToReactFlow(root, [], [], positions);
            const rfNodes = rfData.nodes as RFNode[];
            const rfEdges = rfData.edges as RFEdge[];

            let globalOffset = 0;

            // Step 1: Animate search traversal
            path.forEach((id, idx) => {
                controller.scheduleStep(() => { // Description step
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
                    const currentNode = rfNodes.find(n => n.id === id);
                    setDescription(`Searching for node ${value} to remove. Comparing with ${currentNode?.data.label}.`);
                }, animationSpeed * (idx * 2 + 1));

                controller.scheduleStep(() => { // Pause step
                    // Keep description visible for a short duration
                    // No visual change, just a pause
                }, animationSpeed * (idx * 2 + 2));
            });
            globalOffset = path.length * 2;

            // Step 2: Not found
            if (!found) {
                globalOffset++;
                controller.scheduleStep(() => {
                    setNodes(rfNodes); // Ensure nodes are reset to original state
                    setEdges(rfEdges); // Ensure edges are reset to original state
                    setDescription(`❌ ${value} was not found in the tree.`);
                    controller.scheduleStep(() => setDescription(''), animationSpeed * 4); // Longer delay for final state
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
                setDescription(`Found ${value}! Preparing for removal...`);
            }, animationSpeed * globalOffset);
            globalOffset++; // Pause after description
            controller.scheduleStep(() => {}, animationSpeed * globalOffset);

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
                    setDescription(`Node has two children. Finding its inorder successor to take its place.`);
                }, animationSpeed * globalOffset);
                globalOffset++; // Pause after description
                controller.scheduleStep(() => {}, animationSpeed * globalOffset);
            }

            // Step 5: Perform Removal and Animate Structural Shift
            const rootCopy = cloneBSTTree(root);
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
                    setDescription('Re-wiring connections to remove the node...'); // Description for topology change
                }, animationSpeed * globalOffset);

                globalOffset++; // Pause after description
                controller.scheduleStep(() => {}, animationSpeed * globalOffset);

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
                        setDescription('Re-arranging nodes to the new structure...'); // Description for geometry change
                    }, animationSpeed * fractionOffset);
                }
                globalOffset++;
                // No explicit pause needed here, as the next step is the final state update.

                // Step 5c: Final State Update
                globalOffset++;
                controller.scheduleStep(() => {
                    // The nodes are already in their final highlighted state from the interpolation.
                    // We just update the description and schedule the final cleanup.
                    setDescription(`Removed ${value}.`);
                    controller.scheduleStep(() => {
                        setBSTRoot(newRoot);
                        setNodes(finalRF.nodes as RFNode[]);
                        setEdges(finalRF.edges as RFEdge[]);
                        setDescription(''); // Clear final description
                    }, animationSpeed * 4);
                }, animationSpeed * globalOffset);
            } else {
                // Tree is completely empty
                globalOffset++;
                controller.scheduleStep(() => {
                    setBSTRoot(null);
                    setNodes([]);
                    setEdges([]);
                    setDescription(`Removed ${value}. The tree is now empty.`);
                    controller.scheduleStep(() => setDescription(''), animationSpeed * 4);
                }, animationSpeed * globalOffset);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [setBSTRoot, animationSpeed, isPausedRef, setNodes, setEdges, setDescription]
    );

    const cancelAnimation = useCallback(() => {
        controllerRef.current?.clearAll();
    }, []);

    return { handleRemove, cancelAnimation };
}
