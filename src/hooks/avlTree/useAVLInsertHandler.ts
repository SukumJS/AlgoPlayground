import { useCallback, useRef, MutableRefObject } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { AnimationController } from '@/src/components/visualizer/animations/Tree/animationController';
import type { AnimationCallbacks } from '@/src/components/visualizer/animations/types';
import {
    findInsertionPosition,
    insertAVLWithSteps,
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

export function useAVLInsertHandler(params: {
    avlRoot: AVLTreeNode | null;
    setAVLRoot: (root: AVLTreeNode | null) => void;
    nodeIdCounter: number;
    animationSpeed: number;
    rf: any;
    animationCallbacks: AnimationCallbacks;
    isPausedRef: MutableRefObject<boolean>;
    setIsAnimating: (v: boolean) => void;
    setAnimationDescription: (desc: string) => void;
    setNodeIdCounter: (v: number) => void;
}) {
    const {
        avlRoot,
        setAVLRoot,
        nodeIdCounter,
        animationSpeed,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setAnimationDescription,
        setNodeIdCounter,
    } = params;

    const counterRef = useRef(0);

    const handleAVLInsert = useCallback((valueToInsert: number) => {
        const controller = new AnimationController(isPausedRef);
        setIsAnimating(true);

        const latestRoot = avlRoot;

        // --- Duplicate check ---
        const insertionPos = findInsertionPosition(latestRoot, valueToInsert);
        if (latestRoot && insertionPos.parentId === null && latestRoot.value === valueToInsert) {
            setIsAnimating(false);
            setAnimationDescription(`⚠️ Value ${valueToInsert} already exists!`);
            setTimeout(() => setAnimationDescription(""), 2000);
            return;
        }

        const newNodeId = `avl_${nodeIdCounter}_${counterRef.current++}`;
        const path = insertionPos.path || [];
        const parentId = insertionPos.parentId;
        const parentValue = insertionPos.parentValue;
        const position = insertionPos.position;

        // --- Pre-compute all intermediate states ---
        const { afterInsert, rotationType, rotationNodeId, afterRebalance } =
            insertAVLWithSteps(latestRoot, valueToInsert, newNodeId);

        // --- Build ReactFlow for each state ---
        const oldPositions = calculateTreePositions(latestRoot);
        const oldRF = latestRoot
            ? avlTreeToReactFlow(latestRoot, [], [], oldPositions)
            : { nodes: [], edges: [] };

        const insertedPositions = calculateTreePositions(afterInsert);
        const insertedRF = avlTreeToReactFlow(afterInsert, [], [], insertedPositions);

        const finalPositions = calculateTreePositions(afterRebalance);
        const finalRF = avlTreeToReactFlow(afterRebalance, [], [], finalPositions);

        let offset = 0;

        // ── Step 1: Traverse path (highlight each node visited) ──
        if (path.length > 0) {
            path.forEach((nodeId, idx) => {
                controller.scheduleStep(() => {
                    const hl = (oldRF.nodes as RFNode[]).map((n: RFNode) => ({
                        ...n,
                        data: {
                            ...n.data,
                            isHighlighted: n.id === nodeId,
                            highlightColor: n.id === nodeId ? '#62A2F7' : undefined,
                        },
                    }));
                    animationCallbacks.setNodes(hl);
                    animationCallbacks.setEdges(oldRF.edges as RFEdge[]);
                    setAnimationDescription(`🔍 Traversing — comparing with node`);
                }, animationSpeed * (idx + 1));
                offset = idx + 1;
            });
        }

        // ── Step 2: Highlight parent (yellow) ──
        if (parentId) {
            offset++;
            controller.scheduleStep(() => {
                const hl = (oldRF.nodes as RFNode[]).map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === parentId,
                        highlightColor: n.id === parentId ? '#F7AD45' : undefined,
                    },
                }));
                animationCallbacks.setNodes(hl);
                setAnimationDescription(
                    `📍 Found parent ${parentValue} — inserting ${valueToInsert} as ${position}`
                );
            }, animationSpeed * offset);
        }

        // ── Step 3: Show tree after BST insert (before rebalance) ──
        offset++;
        controller.scheduleStep(() => {
            const hl = (insertedRF.nodes as RFNode[]).map((n: RFNode) => ({
                ...n,
                data: {
                    ...n.data,
                    isHighlighted: n.id === newNodeId,
                    highlightColor: n.id === newNodeId ? '#4CAF7D' : undefined,
                },
            }));
            animationCallbacks.setNodes(hl);
            animationCallbacks.setEdges(insertedRF.edges as RFEdge[]);
            setAnimationDescription(`✅ Inserted ${valueToInsert}. Checking balance...`);
        }, animationSpeed * offset);

        // ── Step 4: Check balance — highlight path back up with BF badges ──
        const bfMap = collectBFs(afterInsert);
        const reversePath = [...path].reverse();
        reversePath.forEach((nodeId, idx) => {
            offset++;
            controller.scheduleStep(() => {
                const hl = (insertedRF.nodes as RFNode[]).map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === nodeId,
                        highlightColor: n.id === nodeId
                            ? (nodeId === rotationNodeId ? '#EF4444' : '#9B59B6')
                            : (n.id === newNodeId ? '#4CAF7D' : undefined),
                        balanceFactor: bfMap.get(n.id),
                    },
                }));
                animationCallbacks.setNodes(hl);
                const bf = bfMap.get(nodeId) ?? 0;
                if (nodeId === rotationNodeId) {
                    setAnimationDescription(`⚠️ Balance Factor = ${bf} — Imbalanced! Need ${rotationType}`);
                } else {
                    setAnimationDescription(`⚖️ Balance Factor = ${bf} — Balanced ✓`);
                }
            }, animationSpeed * offset);
        });

        // ── Step 5: If rotation needed, show the rotation result ──
        if (rotationType) {
            offset++;
            controller.scheduleStep(() => {
                const hl = (finalRF.nodes as RFNode[]).map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: n.id === rotationNodeId || n.id === newNodeId,
                        highlightColor: n.id === rotationNodeId ? '#F7AD45'
                            : n.id === newNodeId ? '#4CAF7D' : undefined,
                    },
                }));
                animationCallbacks.setNodes(hl);
                animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
                setAnimationDescription(`🔄 ${rotationType} — Tree rebalanced!`);
            }, animationSpeed * offset);
        } else {
            offset++;
            controller.scheduleStep(() => {
                animationCallbacks.setNodes(finalRF.nodes as RFNode[]);
                animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
                setAnimationDescription(`✅ Tree is balanced. No rotation needed.`);
            }, animationSpeed * offset);
        }

        // ── Step 6: Final clean state ──
        offset++;
        controller.scheduleStep(() => {
            setAVLRoot(afterRebalance);
            animationCallbacks.setNodes(finalRF.nodes as RFNode[]);
            animationCallbacks.setEdges(finalRF.edges as RFEdge[]);
            setAnimationDescription('');
            setIsAnimating(false);
            setNodeIdCounter(nodeIdCounter + 1);
        }, animationSpeed * offset);

    }, [
        avlRoot, setAVLRoot, nodeIdCounter, animationSpeed,
        animationCallbacks, isPausedRef, setIsAnimating,
        setAnimationDescription, setNodeIdCounter
    ]);

    return handleAVLInsert;
}
