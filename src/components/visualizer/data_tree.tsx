"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback, useMemo, useEffect, useRef, useTransition } from "react";
import { useReactFlow, XYPosition } from "@xyflow/react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";
import { Plus, Search, Trash } from "lucide-react";
import { GLOW_ZONE } from "./tutorial_tree";
import {
    rebuildAVLTreeFromNodes,
    removeAVL,
    insertAVL,
    type AVLTreeNode,
    searchAVL,
    getBalanceFactor,
} from "@/src/components/visualizer/algorithmsTree/avlTree";
import { type AnimationCallbacks } from "@/src/components/visualizer/animations/types";

import { useAVLInsertHandler } from "@/src/hooks/avlTree/useAVLInsertHandler";
import { useAVLSearchHandler } from "@/src/hooks/avlTree/useAVLSearchHandler";
import { useAVLRemoveHandler } from "@/src/hooks/avlTree/useAVLRemoveHandler";
import { useAVLRebalanceHandler } from "@/src/hooks/avlTree/useAVLRebalanceHandler";

// BST
import { useBSTInsertHandler } from "@/src/hooks/BST/useBSTInsertHandler";
import { useBSTSearchHandler } from "@/src/hooks/BST/useBSTSearchHandler";
import { useBSTRemoveHandler } from "@/src/hooks/BST/useBSTRemoveHandler";
import { insertBST, cloneBSTTree, type BSTNode, removeBST } from "@/src/components/visualizer/algorithmsTree/bstTree";

// Binary Tree (no BST constraint)
import { useBTInsertHandler } from "@/src/hooks/BinaryTree/useBTInsertHandler";
import { useBTSearchHandler } from "@/src/hooks/BinaryTree/useBTSearchHandler";
import { useBTRemoveHandler } from "@/src/hooks/BinaryTree/useBTRemoveHandler";
import { useBTTraversalHandler } from "@/src/hooks/BinaryTree/useBTTraversalHandler";
import { type BTNode, removeBT, rebuildBTFromReactFlow } from "@/src/components/visualizer/algorithmsTree/binaryTree";
import { calculateBTPositions, btToReactFlow } from "@/src/components/visualizer/algorithmsTree/binaryTree";

// Heap
import { useHeapInsertHandler } from "@/src/hooks/Heap/useHeapInsertHandler";
import { useHeapSearchHandler } from "@/src/hooks/Heap/useHeapSearchHandler";
import { useHeapRemoveHandler } from "@/src/hooks/Heap/useHeapRemoveHandler";
import { removeHeap, insertHeap, cloneHeap, calculateHeapPositions, heapToReactFlow, type HeapNode } from "@/src/components/visualizer/algorithmsTree/heapTree";

import { resolveColor } from '@/src/components/visualizer/animations/highlightColors';

// let id = 0;
const getId = () => `dndnode_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const BST_ALGORITHMS = ['binary-search-tree'];
const BT_ALGORITHMS = ['binary-tree-inorder', 'binary-tree-preorder', 'binary-tree-postorder'];

interface Data_treeProps {
    tutorialMode?: boolean;
    tutorialStep?: number;
    onTutorialDropSuccess?: () => void;
    currentNodes?: Array<{ id: string; data: { label: string } }>;
    currentEdges?: Array<{ source: string, target: string, sourceHandle?: string | null }>;
    algorithm?: string;
    onRebalanceReady?: (fn: () => void) => void;
    initialBSTRoot?: BSTNode | null;
    initialBTRoot?: BTNode | null;
    initialHeapRoot?: HeapNode | null;
    initialAVLRoot?: AVLTreeNode | null;
    onBTRebalanceReady?: (fn: () => void) => void;
    onHeapRebalanceReady?: (fn: () => void) => void;
    onTrashDeleteReady?: (fn: (nodeId: string, value: number) => void) => void;
    onAutoInsertReady?: (fn: (value: number) => void) => void;
    showAVLBalance?: boolean;
    // explanation callback lifted from PlaygroundTree
    setExplanation?: React.Dispatch<React.SetStateAction<string>>;
}

function Data_tree({
    tutorialMode = false,
    tutorialStep = 0,
    onTutorialDropSuccess,
    currentNodes = [],
    currentEdges = [],
    algorithm,
    onRebalanceReady,
    onBTRebalanceReady,
    initialBSTRoot = null,
    initialBTRoot = null,
    initialHeapRoot = null,
    initialAVLRoot = null,
    onTrashDeleteReady,
    onHeapRebalanceReady,
    onAutoInsertReady,
    showAVLBalance = true,
    setExplanation,
}: Data_treeProps) {
    const [isDataSortOpen, setIsDataSortOpen] = useState(true);
    const { onDragStart, isDragging } = useDnD();
    const [type, setType] = useState<string | null>(null);
    const rf = useReactFlow();
    const { setNodes, setEdges } = rf;
    const [, startTransition] = useTransition();

    const [inputValue, setInputValue] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const [removeValue, setRemoveValue] = useState<string>("");
    const [draggedValue, setDraggedValue] = useState<number | null>(null);
    const [nodeIdCounter, setNodeIdCounter] = useState(5);

    // Draggable Sidebar Node State
    const [randomNodes, setRandomNodes] = useState<number[]>([]);
    const [draggableInputValue, setDraggableInputValue] = useState<number | ''>('');

    // Animation states
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed] = useState(500);
    const isPausedRef = useRef<boolean>(false);

    // Tree roots
    const [bstRoot, setBSTRoot] = useState<BSTNode | null>(initialBSTRoot);
    const [btRoot, setBTRoot] = useState<BTNode | null>(initialBTRoot);
    const [heapRoot, setHeapRoot] = useState<HeapNode | null>(initialHeapRoot);
    const [avlRoot, setAVLRoot] = useState<AVLTreeNode | null>(() => {
        if (initialAVLRoot) return initialAVLRoot;
        if (currentNodes.length === 0) return null;
        const numericNodes = currentNodes.filter(n => !isNaN(parseInt(n.data.label)));
        if (numericNodes.length === 0) return null;
        return rebuildAVLTreeFromNodes(numericNodes);
    });

    const isBST = BST_ALGORITHMS.includes(algorithm ?? '');
    const isBT = BT_ALGORITHMS.includes(algorithm ?? '');
    const isAVL = algorithm === 'avl-tree';
    const isHeap = algorithm === 'min-heap' || algorithm === 'max-heap';
    const isMinHeap = algorithm === 'min-heap';
    const hasTraversal = isBT;
    const traversalType = isBT ? algorithm : null;

    // sync initial roots
    const bstInitRef = useRef(false);
    const avlInitRef = useRef(false);
    useEffect(() => {
        if (!bstInitRef.current && initialBSTRoot) {
            setTimeout(() => {
                setBSTRoot(initialBSTRoot);
                bstInitRef.current = true;
            }, 0);
        }
    }, [initialBSTRoot]);

    useEffect(() => {
        if (!avlInitRef.current && initialAVLRoot) {
            setTimeout(() => {
                setAVLRoot(initialAVLRoot);
                avlInitRef.current = true;
            }, 0);
        }
    }, [initialAVLRoot]);

    // Auto-rebalance AVL tree whenever the showAVLBalance flag toggles so nodes re-render with the new label geometry
    useEffect(() => {
        if (isAVL && avlRoot) {
            // Force re-render the balance factors immediately, without waiting for the slow animation controller
            setNodes(nds => nds.map(node => {
                let balanceFactor;
                if (showAVLBalance) {
                    const treeNode = searchAVL(avlRoot, parseInt(node.data.label as string)).node;
                    if (treeNode) balanceFactor = getBalanceFactor(treeNode);
                }

                return {
                    ...node,
                    data: {
                        ...node.data,
                        balanceFactor
                    }
                };
            }));
        }
    }, [showAVLBalance, isAVL, avlRoot, setNodes]);

    // For generic Binary Trees, we rebuild the root continuously from React Flow nodes and edges
    // to support freeform drawing without strict balancing.
    const nodesStr = JSON.stringify(currentNodes);
    const edgesStr = JSON.stringify(currentEdges);

    useEffect(() => {
        if (isBT && !isAnimating) {
            // Parse the strings to avoid reference equality triggering infinite loops
            setTimeout(() => {
                setBTRoot(rebuildBTFromReactFlow(JSON.parse(nodesStr), JSON.parse(edgesStr)));
            }, 0);
        }
    }, [isBT, isAnimating, nodesStr, edgesStr]);

    const heapInitRef = useRef(false);
    useEffect(() => {
        if (!heapInitRef.current && initialHeapRoot && isHeap) {
            setTimeout(() => {
                setHeapRoot(initialHeapRoot);
                heapInitRef.current = true;
            }, 0);
        }
    }, [initialHeapRoot, isHeap, setHeapRoot]);

    // reset on clear
    const prevLenRef = useRef(currentNodes.length);
    useEffect(() => {
        const prev = prevLenRef.current;
        prevLenRef.current = currentNodes.length;
        if (prev > 0 && currentNodes.length === 0) {
            startTransition(() => {
                setBSTRoot(null);
                setBTRoot(null);
                setAVLRoot(null);
                setHeapRoot(null);
            });
        }
    }, [currentNodes.length, setAVLRoot, setHeapRoot, startTransition]);

    // remove broken explanation logic

    // initialize BST from empty
    const isInitialLoadDone = useRef(false);
    useEffect(() => {
        // Only trigger initialization if NOT in tutorial mode and currently empty.
        // During tutorial, the parent (PlaygroundTree -> useTreeTutorial) handles initialization.
        if (isBST && bstRoot === null && currentNodes.length === 0 && !tutorialMode && !isInitialLoadDone.current) {
            const arr = [6, 3, 11, 2, 5, 8, 14, 1, 4, 10, 15];

            // Rebuild tree logically with sequential delays off
            // ...
        }
    }, [currentNodes]);

    // Generate random un-used nodes for the sidebar (Limit to 10 max)
    const generateRandomNodes = useCallback((count: number) => {
        const existingValues = new Set([
            ...currentNodes.map(n => parseInt(n.data.label)).filter(v => !isNaN(v)),
            ...randomNodes
        ]);

        const newNodes: number[] = [];
        let attempts = 0;

        while (newNodes.length < count && attempts < 1000) {
            const val = Math.floor(Math.random() * 99) + 1; // 1 to 99
            if (!existingValues.has(val)) {
                newNodes.push(val);
                existingValues.add(val);
            }
            attempts++;
        }

        if (newNodes.length > 0) {
            setRandomNodes(prev => {
                const updated = [...prev, ...newNodes];
                return updated.slice(0, 10); // Enforce max 10
            });
        }
    }, [currentNodes, randomNodes]);

    // Initialize random nodes on mount or when empty
    useEffect(() => {
        if (randomNodes.length < 10 && !tutorialMode) {
            generateRandomNodes(10 - randomNodes.length);
        }
    }, [randomNodes.length, generateRandomNodes, tutorialMode]);

    // Handle Infinite Scroll for Draggable Nodes (Disabled to force exact 10 size constraint)
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        // Disabled intentional logic: We are keeping it exactly 10 nodes constantly based on removal trigger.
    };

    // Remove node from sidebar when dropped and immediately generate a replacement
    const removeRandomNode = useCallback((valueToRemove: number) => {
        setRandomNodes(prev => prev.filter(v => v !== valueToRemove));
        setTimeout(() => generateRandomNodes(1), 0);
    }, [generateRandomNodes]);
    const animationCallbacks: AnimationCallbacks = useMemo(() => ({
        setNodes: (nodes: RFNode[]) => {
            setNodes(nodes);
        },
        setEdges: (edges: RFEdge[]) => {
            setEdges(edges);
        },
        setDescription: (desc: string) => {
            if (setExplanation) {
                if (desc === "") {
                    const prettyName = algorithm ? algorithm[0].toUpperCase() + algorithm.slice(1).replace(/-/g, ' ') : '';
                    setExplanation(`This section will explain ${prettyName}. Perform an operation to begin.`);
                } else {
                    setExplanation(desc);
                }
            }
        },
        applyHighlighting: (
            nodes: RFNode[], edges: RFEdge[],
            highlightedNodeIds: Set<string>, highlightedEdgeIds: Set<string>,
            color: string,
            edgeColor?: string
        ) => {
            const resolvedColor = resolveColor(color); // '#62A2F7', '#F7AD45', etc.
            const resolvedEdgeColor = edgeColor ? resolveColor(edgeColor) : resolvedColor;

            return {
                highlightedNodes: nodes.map((n: RFNode) => ({
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: highlightedNodeIds.has(n.id),
                        // ส่ง hex ตรงๆ ให้ custom node component
                        highlightColor: highlightedNodeIds.has(n.id) ? resolvedColor : undefined,
                    },
                })),
                highlightedEdges: edges.map((e: RFEdge) => {
                    // If explicit edge IDs are provided, use them
                    // Otherwise, auto-highlight edges connected to highlighted nodes
                    const isEdgeHighlighted = highlightedEdgeIds.size > 0
                        ? highlightedEdgeIds.has(e.id)
                        : edgeColor && (highlightedNodeIds.has(e.source) || highlightedNodeIds.has(e.target));
                    return {
                        ...e,
                        style: isEdgeHighlighted
                            ? { stroke: resolvedEdgeColor, strokeWidth: 3 }
                            : { stroke: '#999', strokeWidth: 2 },
                    };
                }),
            };
        },
    }), [setNodes, setEdges, setExplanation, algorithm]);

    // AVL Handlers
    const handleAVLInsert = useAVLInsertHandler({
        avlRoot, setAVLRoot, nodeIdCounter, animationSpeed, rf, animationCallbacks, isPausedRef, setIsAnimating, setNodeIdCounter,
        setAnimationDescription: animationCallbacks.setDescription,
        showAVLBalance,
    });
    const handleAVLSearch = useAVLSearchHandler({ avlRoot, animationSpeed, rf, animationCallbacks, isPausedRef, setIsAnimating, setSearchValue });
    const handleAVLRemove = useAVLRemoveHandler({ avlRoot, setAVLRoot, animationSpeed, rf, animationCallbacks, isPausedRef, setIsAnimating, setRemoveValue, showAVLBalance });
    const handleAVLRebalance = useAVLRebalanceHandler({ avlRoot, setAVLRoot, rf, animationCallbacks, isPausedRef, setIsAnimating, showAVLBalance });

    // BST Handlers
    const { handleInsert: bstInsert } = useBSTInsertHandler({ bstRoot, setBSTRoot, setNodes, setEdges, setDescription: animationCallbacks.setDescription, animationSpeed, isPausedRef });
    const { handleSearch: bstSearch } = useBSTSearchHandler({ bstRoot, setNodes, setEdges, setDescription: animationCallbacks.setDescription, animationSpeed, isPausedRef });
    const { handleRemove: bstRemove } = useBSTRemoveHandler({ bstRoot, setBSTRoot, setNodes, setEdges, setDescription: animationCallbacks.setDescription, animationSpeed, isPausedRef });

    // BT Handlers
    const { handleInsert: btInsert } = useBTInsertHandler({ btRoot, setBTRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: animationCallbacks.setDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef });
    const { handleSearch: btSearch } = useBTSearchHandler({ btRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: animationCallbacks.setDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef });
    const { handleRemove: btRemove } = useBTRemoveHandler({ btRoot, setBTRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: animationCallbacks.setDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef });
    const { handleInorder, handlePreorder, handlePostorder } = useBTTraversalHandler({ btRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: animationCallbacks.setDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef, setIsAnimating });

    // Heap Handlers
    const { handleInsert: heapInsert } = useHeapInsertHandler({ heapRoot, setHeapRoot, isMinHeap, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: animationCallbacks.setDescription, animationSpeed, isPausedRef, setIsAnimating });
    const { handleSearch: heapSearch } = useHeapSearchHandler({ heapRoot, setNodes, setEdges, setDescription: animationCallbacks.setDescription, animationSpeed, isPausedRef, setIsAnimating });
    const { handleRemove: heapRemove } = useHeapRemoveHandler({ heapRoot, setHeapRoot, isMinHeap, setNodes, setEdges, setDescription: animationCallbacks.setDescription, animationSpeed, isPausedRef, setIsAnimating });

    useEffect(() => { onRebalanceReady?.(handleAVLRebalance); }, [handleAVLRebalance, onRebalanceReady]);

    // Drag & Drop
    const createAddNewNode = useCallback(
        (sampleValue: number): OnDropAction => {
            return ({ position }: { position: XYPosition }) => {
                const nodeCenterCanvasX = position.x;
                const nodeCenterCanvasY = position.y;

                // For a 56x56 node, top-left is offset by -28
                const topLeftX = position.x - 28;
                const topLeftY = position.y - 28;

                if (tutorialMode && tutorialStep === 0) {
                    const targetCenterX = GLOW_ZONE.x + 28;
                    const targetCenterY = GLOW_ZONE.y + 28;
                    const dx = nodeCenterCanvasX - targetCenterX;
                    const dy = nodeCenterCanvasY - targetCenterY;

                    // Huge forgiving drop zone (80px radius instead of strict GLOW_ZONE.radius)
                    if (Math.sqrt(dx * dx + dy * dy) > 80) return;
                }
                const finalPosition = (tutorialMode && tutorialStep === 0)
                    ? { x: GLOW_ZONE.x, y: GLOW_ZONE.y }
                    : { x: topLeftX, y: topLeftY };

                const newNode = {
                    id: getId(), type: "custom", position: finalPosition,
                    data: { label: sampleValue.toString(), variant: "circle" },
                    zIndex: tutorialMode ? 100 : undefined,
                };
                setNodes(nds => nds.concat(newNode));
                setType(null);
                if (sampleValue !== draggableInputValue) {
                    removeRandomNode(sampleValue);
                } else {
                    setDraggableInputValue('');
                }

                if (isBST) setBSTRoot(prev => insertBST(cloneBSTTree(prev), sampleValue, newNode.id));
                // For generic BT, we do NOT auto-insert on drag drop. The user will manually connect it, or we will auto-correct on invalid connect.
                // if (isBT) setBTRoot(prev => insertBT(cloneBT(prev), sampleValue, newNode.id));
                if (isAVL) setAVLRoot(prev => insertAVL(prev, sampleValue, newNode.id));
                if (isHeap) setHeapRoot(prev => {
                    const result = insertHeap(cloneHeap(prev), sampleValue, newNode.id, isMinHeap);
                    return result.root;
                });

                if (tutorialMode && tutorialStep === 0) onTutorialDropSuccess?.();
            };
        },
        [setNodes, tutorialMode, tutorialStep, onTutorialDropSuccess, isBST, isAVL, isHeap, isMinHeap, setAVLRoot, setHeapRoot]
    );

    // Handle insert operation
    const handleInsert = useCallback(() => {
        if (tutorialMode || isAnimating) return;
        const v = inputValue ? parseInt(inputValue) : Math.floor(Math.random() * 100) + 1;
        if (isNaN(v)) return;
        if (algorithm === 'avl-tree') handleAVLInsert(v);
        else if (isBST) bstInsert(v);
        else if (isBT) btInsert(v);
        else if (isHeap) heapInsert(v);
        else console.warn(`Insert not implemented for ${algorithm}`);
        setInputValue('');
    }, [tutorialMode, isAnimating, inputValue, algorithm, isBST, isBT, isHeap, handleAVLInsert, bstInsert, btInsert, heapInsert]);

    // Handle search operation
    const handleSearch = useCallback(() => {
        if (tutorialMode || isAnimating) return;
        const v = searchValue ? parseInt(searchValue) : NaN;
        if (isNaN(v)) return;
        if (algorithm === 'avl-tree') handleAVLSearch(v);
        else if (isBST) bstSearch(v);
        else if (isBT) btSearch(v);
        else if (isHeap) heapSearch(v);
        else console.warn(`Search not implemented for ${algorithm}`);
        setSearchValue('');
    }, [tutorialMode, isAnimating, searchValue, algorithm, isBST, isBT, isHeap, handleAVLSearch, bstSearch, btSearch, heapSearch]);

    // Handle remove operation
    const handleRemove = useCallback(() => {
        if (tutorialMode || isAnimating) return;
        const v = removeValue ? parseInt(removeValue) : NaN;
        if (isNaN(v)) return;
        if (isAVL) handleAVLRemove(v);
        else if (isBST) bstRemove(v);
        else if (isBT) btRemove(v);
        else if (isHeap) heapRemove(v);
        else console.warn(`Remove not implemented for ${algorithm}`);
        setRemoveValue('');
    }, [tutorialMode, isAnimating, removeValue, algorithm, isBST, isBT, isAVL, isHeap, handleAVLRemove, bstRemove, btRemove, heapRemove]);

    // Handle rebalance operation
    const handleBTRebalance = useCallback(() => {
        const root = btRoot;
        if (!root) return;

        setEdges([]);

        setTimeout(() => {
            const positions = calculateBTPositions(root);
            const { nodes: rfNodes, edges: rfEdges } = btToReactFlow(root, [], [], positions);
            setNodes(rfNodes as RFNode[]);
            setEdges(rfEdges as RFEdge[]);
        }, 0);
    }, [btRoot, setNodes, setEdges]);

    useEffect(() => { onRebalanceReady?.(handleAVLRebalance); }, [handleAVLRebalance, onRebalanceReady]);
    useEffect(() => { onBTRebalanceReady?.(handleBTRebalance); }, [handleBTRebalance, onBTRebalanceReady]);
    useEffect(() => { onAutoInsertReady?.(btInsert); }, [btInsert, onAutoInsertReady]);

    // Handle heap rebalance (reposition heap nodes from heapRoot after tutorial)
    const handleHeapRebalance = useCallback(() => {
        const root = heapRoot;
        if (!root) return;

        setEdges([]);

        setTimeout(() => {
            const positions = calculateHeapPositions(root);
            const { nodes: rfNodes, edges: rfEdges } = heapToReactFlow(root, [], [], positions, 'heap-edge');
            setNodes(rfNodes as RFNode[]);
            setEdges(rfEdges as RFEdge[]);
        }, 0);
    }, [heapRoot, setNodes, setEdges]);

    useEffect(() => { onHeapRebalanceReady?.(handleHeapRebalance); }, [handleHeapRebalance, onHeapRebalanceReady]);

    // Handle trash-bin deletion: sync internal tree roots
    const handleTrashDelete = useCallback((nodeId: string, value: number) => {
        if (isBST) {
            setBSTRoot(prev => prev ? removeBST(prev, value) : null);
        }
        if (isBT) {
            setBTRoot(prev => prev ? removeBT(prev, value).newRoot : null);
        }
        if (isAVL) {
            setAVLRoot(prev => prev ? removeAVL(prev, value) : null);
        }
        if (isHeap) {
            setHeapRoot(prev => prev ? removeHeap(prev, value, isMinHeap).root : null);
        }
    }, [isBST, isBT, isAVL, isHeap, isMinHeap, setAVLRoot, setHeapRoot]);

    useEffect(() => { onTrashDeleteReady?.(handleTrashDelete); }, [handleTrashDelete, onTrashDeleteReady]);

    // Handle reset operation
    const handleReset = useCallback(() => {
        if (tutorialMode) return;
        setInputValue(''); setSearchValue(''); setRemoveValue('');
        setBSTRoot(null); setBTRoot(null); setAVLRoot(null); setHeapRoot(null);
    }, [tutorialMode, setAVLRoot, setHeapRoot]);

    // Toggle expand/collapse
    const handleToggle = useCallback(() => {
        if (tutorialMode) return;
        setIsDataSortOpen(prev => !prev);
    }, [tutorialMode]);

    return (
        <>
            {/* Ghost node when dragging */}
            {isDragging && <DragGhost type={type} value={draggedValue} />}

            {/* Header button */}
            <button
                suppressHydrationWarning
                className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${isDataSortOpen ? "bg-gray-200 h-12" : "bg-white"
                    } ${tutorialMode ? "cursor-default" : ""}`}
                onClick={handleToggle}
            >
                <div className="flex items-center">
                    <div
                        className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? "" : "hidden opacity-100"
                            }`}
                    ></div>
                    <div className="flex text-lg p-2">Data</div>
                </div>
                <div className="mr-2 flex justify-end">
                    {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>

            {/* Content area */}
            <div className={`flex-col ${isDataSortOpen ? "opacity-100" : "opacity-0"}`}>
                {/* Draggable sample nodes */}
                <div
                    className="transition-all duration-300 ease-in-out overflow-x-auto flex gap-2 mb-2 p-2"
                    onScroll={handleScroll}
                >
                    {/* Input Node Item (Always First) */}
                    <div
                        className="shrink-0 flex justify-center items-center border-2 border-[#5D5D5D] bg-[#D9E363] w-16 h-16 rounded-full cursor-grab"
                        onPointerDown={(event) => {
                            const value = typeof draggableInputValue === 'number' ? draggableInputValue : 0;
                            setType("input");
                            setDraggedValue(value);
                            onDragStart(event, createAddNewNode(value));
                        }}
                    >
                        <input
                            suppressHydrationWarning
                            type="number"
                            placeholder="0"
                            className="w-12 h-full rounded-full bg-transparent text-center text-[#222121] font-semibold text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 m-0"
                            value={draggableInputValue}
                            onChange={(e) => setDraggableInputValue(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking input
                        />
                    </div>

                    {/* Dynamic Random Node Items */}
                    {tutorialMode ? (
                        // Mock up the original 3, 67, 46 for tutorial
                        [{ number: 3 }, { number: 67 }, { number: 46 }].map((item, index) => (
                            <div
                                key={`tut-${index}`}
                                className="shrink-0 w-16 h-16 rounded-full flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] cursor-grab bg-[#D9E363]"
                                data-tutorial-target={item.number === 3 ? "sidebar-node-3" : undefined}
                                onPointerDown={(event) => {
                                    setType("custom");
                                    setDraggedValue(item.number);
                                    onDragStart(event, createAddNewNode(item.number));
                                }}
                            >
                                {item.number}
                            </div>
                        ))
                    ) : (
                        randomNodes.map((value, index) => (
                            <div
                                key={value}
                                className="shrink-0 w-16 h-16 rounded-full flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] cursor-grab bg-[#D9E363]"
                                onPointerDown={(event) => {
                                    setType("custom");
                                    setDraggedValue(value);
                                    onDragStart(event, createAddNewNode(value));
                                }}
                            >
                                {value}
                            </div>
                        ))
                    )}
                </div>

                <div className={`flex-col justify-center items-center text-center ${tutorialMode ? "pointer-events-none opacity-60" : ""}`}>

                    {/* Traversal Buttons (เฉพาะ bt-* algorithms) */}
                    {hasTraversal && (
                        <div className="grid-cols-1 grid gap-2 text-start m-1">
                            <p className="font-bold text-md">Traversal</p>
                            <div className="flex gap-2">
                                {traversalType === 'binary-tree-inorder' && (
                                    <button
                                        className="flex-1 bg-[#222121] text-white rounded-lg p-2 text-sm font-semibold disabled:opacity-50 transition-colors"
                                        onClick={handleInorder}
                                        disabled={isAnimating}
                                        title="Left → Root → Right"
                                    >
                                        Traversal Inorder
                                    </button>
                                )}
                                {traversalType === 'binary-tree-preorder' && (
                                    <button
                                        className="flex-1 bg-[#222121] text-white rounded-lg p-2 text-sm font-semibold disabled:opacity-50 transition-colors"
                                        onClick={handlePreorder}
                                        disabled={isAnimating}
                                        title="Root → Left → Right"
                                    >
                                        Traversal Preorder
                                    </button>
                                )}
                                {traversalType === 'binary-tree-postorder' && (
                                    <button
                                        className="flex-1 bg-[#222121] text-white rounded-lg p-2 text-sm font-semibold disabled:opacity-50 transition-colors"
                                        onClick={handlePostorder}
                                        disabled={isAnimating}
                                        title="Left → Right → Root"
                                    >
                                        Traversal Postorder
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Insert */}
                    <div className="grid-cols-1 grid gap-2 text-start m-1">
                        <p className="font-bold text-md">Insert</p>
                        <div className="flex gap-2">
                            <input
                                suppressHydrationWarning
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isAnimating}
                            />
                            <button
                                suppressHydrationWarning
                                className="bg-[#222121] rounded-lg p-2 disabled:opacity-50"
                                onClick={handleInsert}
                                disabled={isAnimating}
                            >
                                <Plus color="white" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="grid-cols-1 grid gap-2 text-start m-1">
                        <p className="font-bold text-md">Search</p>
                        <div className="flex gap-2">
                            <input
                                suppressHydrationWarning
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                disabled={isAnimating}
                            />
                            <button
                                suppressHydrationWarning
                                className="bg-[#222121] rounded-lg p-2 disabled:opacity-50"
                                onClick={handleSearch}
                                disabled={isAnimating}
                            >
                                <Search color="white" />
                            </button>
                        </div>
                    </div>

                    {/* Remove */}
                    <div className="grid-cols-1 grid gap-2 text-start m-1">
                        <p className="font-bold text-md">Remove</p>
                        <div className="flex gap-2">
                            <input
                                suppressHydrationWarning
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={removeValue}
                                onChange={(e) => setRemoveValue(e.target.value)}
                                disabled={isAnimating}
                            />
                            <button
                                suppressHydrationWarning
                                className="bg-[#E82B2B] rounded-lg p-2 disabled:opacity-50"
                                onClick={handleRemove}
                                disabled={isAnimating}
                            >
                                <Trash color="white" />
                            </button>
                        </div>
                    </div>

                    <RandomSize onReset={handleReset} />
                </div>
            </div>
        </>
    );
}

export default Data_tree;

interface DragGhostProps {
    type: string | null;
    value: number | null;
}

export function DragGhost({ type, value }: DragGhostProps) {
    const { position } = useDnDPosition();

    if (!position || !type) return null;

    return (
        <div
            className="fixed top-0 left-0 pointer-events-none z-1000 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#5D5D5D] bg-[#D9E363] text-center text-2xl font-semibold text-[#222121] shadow-lg"
            style={{
                transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
            }}
        >
            {value}
        </div>
    );
}