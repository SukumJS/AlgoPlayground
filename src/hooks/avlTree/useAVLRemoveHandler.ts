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

        // Step 6: Show final rebalanced tree
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

            if (rotationType) {
                animationCallbacks.setDescription(`🔄 ${rotationType} — Tree rebalanced!`);
            } else {
                animationCallbacks.setDescription(`✅ Removed ${value}. Tree is balanced.`);
            }
        }, animationSpeed * offset);

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