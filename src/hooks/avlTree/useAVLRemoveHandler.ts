import { useCallback, MutableRefObject } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/types';
import {
    searchAVL,
    removeAVLWithSteps,
    calculateTreePositions,
    avlTreeToReactFlow,
    getBalanceFactor,
    type AVLTreeNode,
} from '@/src/components/visualizer/algorithmsTree/AVLtree/avlTree';

/** Collect balance factors for all nodes in an AVL tree */
function collectBFs(node: AVLTreeNode | null, map: Map<string, number> = new Map()): Map<string, number> {
    if (!node) return map;
    map.set(node.id, getBalanceFactor(node));
    collectBFs(node.left, map);
    collectBFs(node.right, map);
    return map;
}

function cloneAVL(node: AVLTreeNode | null): AVLTreeNode | null {
    if (!node) return null;
    return JSON.parse(JSON.stringify(node));
}

export function useAVLRemoveHandler(params: {
    avlRoot: AVLTreeNode | null;
    setAVLRoot: (root: AVLTreeNode | null) => void;
    animationSpeed: number;
    rf: any;
    animationCallbacks: AnimationCallbacks;
    isPausedRef: MutableRefObject<boolean>;
    setIsAnimating: (v: boolean) => void;
    setRemoveValue: (v: string) => void;
}) {
    const {
        avlRoot,
        setAVLRoot,
        animationSpeed,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setRemoveValue
    } = params;

    const handleAVLRemove = useCallback((value: number) => {
        const controller = new AnimationController(isPausedRef);
        setIsAnimating(true);

        if (!avlRoot) {
            animationCallbacks.setDescription('Tree is empty');
            setIsAnimating(false);
            setRemoveValue('');
            return;
        }

        // Pre-compute
        const { found, nodeId, path } = searchAVL(avlRoot, value);
        const positions = calculateTreePositions(avlRoot);
        const rfData = avlTreeToReactFlow(avlRoot, [], [], positions);
        const rfNodes = rfData.nodes as RFNode[];
        const rfEdges = rfData.edges as RFEdge[];

        let offset = 0;

        // Step 1: Traverse search path
        path.forEach((id, idx) => {
            controller.scheduleStep(() => {
                const hl = rfNodes.map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === id,
                        highlightColor: n.id === id ? '#62A2F7' : undefined,
                    },
                }));
                animationCallbacks.setNodes(hl);
                animationCallbacks.setEdges(rfEdges);
                animationCallbacks.setDescription(`🔍 Searching for ${value}...`);
            }, animationSpeed * (idx + 1));
            offset = idx + 1;
        });

        // Not found
        if (!found) {
            offset++;
            controller.scheduleStep(() => {
                animationCallbacks.setNodes(rfNodes);
                animationCallbacks.setEdges(rfEdges);
                animationCallbacks.setDescription(`✗ ${value} not found`);
                controller.scheduleStep(() => {
                    animationCallbacks.setDescription('');
                    setIsAnimating(false);
                    setRemoveValue('');
                }, animationSpeed * 2);
            }, animationSpeed * offset);
            return;
        }

        // Step 2: Highlight found node (red)
        offset++;
        controller.scheduleStep(() => {
            const hl = rfNodes.map((n: RFNode) => ({
                ...n,
                data: {
                    ...n.data,
                    isHighlighted: n.id === nodeId,
                    highlightColor: n.id === nodeId ? '#EF4444' : undefined,
                },
            }));
            animationCallbacks.setNodes(hl);
            animationCallbacks.setEdges(rfEdges);
            animationCallbacks.setDescription(`❌ Found ${value}! Removing...`);
        }, animationSpeed * offset);

        // Pre-compute removal steps
        const { successorId, afterRemove, rotationType, rotationNodeId, afterRebalance } =
            removeAVLWithSteps(avlRoot, value);

        // Step 3: Show successor (if 2-child case)
        if (successorId) {
            offset++;
            controller.scheduleStep(() => {
                const hl = rfNodes.map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === successorId || n.id === nodeId,
                        highlightColor: n.id === successorId ? '#F7AD45'
                            : n.id === nodeId ? '#EF4444' : undefined,
                    },
                }));
                animationCallbacks.setNodes(hl);
                animationCallbacks.setEdges(rfEdges);
                animationCallbacks.setDescription(`🔄 Found inorder successor — will replace deleted node`);
            }, animationSpeed * offset);
        }

        // Step 4: Show tree after deletion (before rebalance)
        if (afterRemove) {
            const removedPositions = calculateTreePositions(afterRemove);
            const removedRF = avlTreeToReactFlow(afterRemove, [], [], removedPositions);

            offset++;
            controller.scheduleStep(() => {
                animationCallbacks.setNodes(removedRF.nodes as RFNode[]);
                animationCallbacks.setEdges(removedRF.edges as RFEdge[]);
                animationCallbacks.setDescription(`🗑️ Node removed. Checking balance...`);
            }, animationSpeed * offset);

            // Step 5: Check balance going back up with BF badges
            const bfMap = collectBFs(afterRemove);
            const checkPath = [...path].reverse();
            checkPath.forEach((id) => {
                offset++;
                controller.scheduleStep(() => {
                    const hl = (removedRF.nodes as RFNode[]).map((n: RFNode) => ({
                        ...n,
                        data: {
                            ...n.data,
                            isHighlighted: n.id === id,
                            highlightColor: n.id === id
                                ? (id === rotationNodeId ? '#EF4444' : '#9B59B6')
                                : undefined,
                            balanceFactor: bfMap.get(n.id),
                        },
                    }));
                    animationCallbacks.setNodes(hl);
                    const bf = bfMap.get(id) ?? 0;
                    if (id === rotationNodeId) {
                        animationCallbacks.setDescription(`⚠️ Balance Factor = ${bf} — Imbalanced! Need ${rotationType}`);
                    } else {
                        animationCallbacks.setDescription(`⚖️ Balance Factor = ${bf} — Balanced ✓`);
                    }
                }, animationSpeed * offset);
            });
        }

        // Step 6: Animate the rotation and show final rebalanced tree
        if (rotationType && afterRemove && afterRebalance) {
            const removedPositions = calculateTreePositions(afterRemove);
            const removedRF = avlTreeToReactFlow(afterRemove, [], [], removedPositions);

            const finalPositions = calculateTreePositions(afterRebalance);
            const finalRF = avlTreeToReactFlow(afterRebalance, [], [], finalPositions);

            // Build position maps: before-rotation → after-rotation
            const beforePosMap = new Map<string, { x: number; y: number }>();
            (removedRF.nodes as RFNode[]).forEach(n => {
                beforePosMap.set(n.id, { x: n.position.x, y: n.position.y });
            });
            const afterPosMap = new Map<string, { x: number; y: number }>();
            (finalRF.nodes as RFNode[]).forEach(n => {
                afterPosMap.set(n.id, { x: n.position.x, y: n.position.y });
            });

            // Step 6a: "About to rotate" — highlight rotation node on the unbalanced tree
            offset++;
            controller.scheduleStep(() => {
                const hl = (removedRF.nodes as RFNode[]).map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === rotationNodeId,
                        highlightColor: n.id === rotationNodeId ? '#EF4444' : undefined,
                    },
                }));
                // Highlight the edges connected to rotation node
                const hlEdges = (removedRF.edges as RFEdge[]).map((e: RFEdge) => ({
                    ...e,
                    style: (e.source === rotationNodeId || e.target === rotationNodeId)
                        ? { stroke: '#EF4444', strokeWidth: 3 }
                        : { stroke: '#999', strokeWidth: 2 },
                }));
                animationCallbacks.setNodes(hl);
                animationCallbacks.setEdges(hlEdges);
                animationCallbacks.setDescription(`🔄 Imbalance detected! Need ${rotationType}`);
            }, animationSpeed * offset);

            // Step 6b: Reassign Edges (Topology Update)
            offset++;
            controller.scheduleStep(() => {
                // Keep the nodes in their original (before-rotation) positions, but use finalRF edges
                const tangledNodes = (finalRF.nodes as RFNode[]).map((n: RFNode) => {
                    const before = beforePosMap.get(n.id) || n.position;
                    return {
                        ...n,
                        position: before,
                        data: {
                            ...n.data,
                            isHighlighted: n.id === rotationNodeId,
                            highlightColor: n.id === rotationNodeId ? '#F7AD45' : undefined,
                        },
                    };
                });

                // Highlight the new final edges that involve the rotation node
                const hlEdges = (finalRF.edges as RFEdge[]).map((e: RFEdge) => ({
                    ...e,
                    style: (e.source === rotationNodeId || e.target === rotationNodeId)
                        ? { stroke: '#F7AD45', strokeWidth: 3 }
                        : { stroke: '#999', strokeWidth: 2 },
                }));

                animationCallbacks.setNodes(tangledNodes);
                animationCallbacks.setEdges(hlEdges);
                animationCallbacks.setDescription(`🔗 Disconnecting & Reassigning Child Nodes...`);
            }, animationSpeed * offset);

            // Step 6c: Interpolation frames (Geometry Update)
            const INTERP_FRAMES = 15;
            for (let frame = 1; frame <= INTERP_FRAMES; frame++) {
                const t = frame / INTERP_FRAMES; // 0→1 progress

                // Add offsets fractionally so interpolation takes exactly `animationSpeed` ms total
                const fractionOffset = offset + (frame / INTERP_FRAMES);

                controller.scheduleStep(() => {
                    const interpolated = (finalRF.nodes as RFNode[]).map((n: RFNode) => {
                        const before = beforePosMap.get(n.id);
                        const after = afterPosMap.get(n.id);

                        let pos = n.position;
                        if (before && after) {
                            pos = {
                                x: before.x + (after.x - before.x) * t,
                                y: before.y + (after.y - before.y) * t,
                            };
                        } else if (!before && after) {
                            pos = after;
                        }

                        return {
                            ...n,
                            position: pos,
                            data: {
                                ...n.data,
                                isHighlighted: n.id === rotationNodeId,
                                highlightColor: n.id === rotationNodeId ? '#4CAF7D' : undefined,
                            },
                        };
                    });

                    animationCallbacks.setNodes(interpolated);
                    animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
                    animationCallbacks.setDescription(`✨ Untangling tree structure...`);
                }, animationSpeed * fractionOffset);
            }
            // Advance integer offset past the fractional frames
            offset++;

            // Step 6d: Final rotation result
            offset++;
            controller.scheduleStep(() => {
                animationCallbacks.setNodes(finalRF.nodes as RFNode[]);
                animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
                animationCallbacks.setDescription(`✅ ${rotationType} — Tree rebalanced!`);
            }, animationSpeed * offset);
        } else {
            offset++;
            controller.scheduleStep(() => {
                if (afterRebalance) {
                    const finalPositions = calculateTreePositions(afterRebalance);
                    const finalRF = avlTreeToReactFlow(afterRebalance, [], [], finalPositions);
                    animationCallbacks.setNodes(finalRF.nodes as RFNode[]);
                    animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
                } else {
                    animationCallbacks.setNodes([]);
                    animationCallbacks.setEdges([]);
                }
                animationCallbacks.setDescription(`✅ Removed ${value}. Tree is balanced.`);
            }, animationSpeed * offset);
        }

        // Step 7: Clean up
        offset++;
        controller.scheduleStep(() => {
            setAVLRoot(afterRebalance);
            if (afterRebalance) {
                const pos = calculateTreePositions(afterRebalance);
                const rf = avlTreeToReactFlow(afterRebalance, [], [], pos);
                animationCallbacks.setNodes(rf.nodes as RFNode[]);
                animationCallbacks.setEdges(rf.edges as RFEdge[]);
            }
            animationCallbacks.setDescription('');
            setIsAnimating(false);
            setRemoveValue('');
        }, animationSpeed * offset);

    }, [avlRoot, setAVLRoot, animationSpeed, animationCallbacks, isPausedRef, setIsAnimating, setRemoveValue]);

    return handleAVLRemove;
}