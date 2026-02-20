"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useReactFlow, XYPosition } from "@xyflow/react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";
import { Plus, Search, Trash } from "lucide-react";
import { GLOW_ZONE } from "./tutorial_tree";
import {
    rebuildAVLTreeFromNodes,
    validateTreeStructure,
    type AVLTreeNode,
} from "@/src/components/visualizer/algorithmsTree/AVLtree/avlTree";
import { type AnimationCallbacks } from "@/src/components/visualizer/animations/AVLtree/insertAnimation";

import { useAVLInsertHandler } from "@/src/hooks/AVLTree/useAVLInsertHandler";
import { useAVLSearchHandler } from "@/src/hooks/AVLTree/useAVLSearchHandler";
import { useAVLRemoveHandler } from "@/src/hooks/AVLTree/useAVLRemoveHandler";
import { useAVLRebalanceHandler } from "@/src/hooks/AVLTree/useAVLRebalanceHandler";

// BST
import { useBSTInsertHandler } from "@/src/hooks/ฺBST/useBSTInsertHandler";
import { useBSTSearchHandler } from "@/src/hooks/ฺBST/useBSTSearchHandler";
import { useBSTRemoveHandler } from "@/src/hooks/ฺBST/useBSTRemoveHandler";
import { insertBST, cloneBSTTree, type BSTNode } from "@/src/components/visualizer/algorithmsTree/BST/bstTree";

// Binary Tree (no BST constraint)
import { useBTInsertHandler } from "@/src/hooks/BinaryTree/useBTInsertHandler";
import { useBTSearchHandler } from "@/src/hooks/BinaryTree/useBTSearchHandler";
import { useBTRemoveHandler } from "@/src/hooks/BinaryTree/useBTRemoveHandler";
import { useBTTraversalHandler } from "@/src/hooks/BinaryTree/useBTTraversalHandler";
import { insertBT, cloneBT, type BTNode } from "@/src/components/visualizer/algorithmsTree/BinaryTree/binaryTree";
import { calculateBTPositions, btToReactFlow } from "@/src/components/visualizer/algorithmsTree/BinaryTree/binaryTree";

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
    algorithm?: string;
    onRebalanceReady?: (fn: () => void) => void;
    initialBSTRoot?: BSTNode | null;
    initialBTRoot?: BTNode | null;
    onBTRebalanceReady?: (fn: () => void) => void;
}

function Data_tree({
    tutorialMode = false,
    tutorialStep = 0,
    onTutorialDropSuccess,
    currentNodes = [],
    algorithm,
    onRebalanceReady,
    onBTRebalanceReady,
    initialBSTRoot = null,
    initialBTRoot = null,
}: Data_treeProps) {
    const [isDataSortOpen, setIsDataSortOpen] = useState(true);
    const { onDragStart, isDragging } = useDnD();
    const [type, setType] = useState<string | null>(null);
    const rf = useReactFlow();
    const { setNodes, setEdges } = rf;

    const [inputValue, setInputValue] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const [removeValue, setRemoveValue] = useState<string>("");
    const [draggedValue, setDraggedValue] = useState<number | null>(null);
    const [nodeIdCounter, setNodeIdCounter] = useState(5);

    // Animation states
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed] = useState(500);
    const [, setAnimationDescription] = useState<string>("");
    const isPausedRef = useRef<boolean>(false);

    // Tree roots
    const [bstRoot, setBSTRoot] = useState<BSTNode | null>(initialBSTRoot);
    const [btRoot, setBTRoot] = useState<BTNode | null>(initialBTRoot);

    const isBST = BST_ALGORITHMS.includes(algorithm ?? '');
    const isBT = BT_ALGORITHMS.includes(algorithm ?? '');
    const hasTraversal = isBT;
    const traversalType = isBT ? algorithm : null; // 'binary-tree-inorder' | 'binary-tree-preorder' | 'binary-tree-postorder'

    // sync initial roots
    const bstInitRef = useRef(false);
    const btInitRef = useRef(false);
    useEffect(() => {
        if (!bstInitRef.current && initialBSTRoot) { setBSTRoot(initialBSTRoot); bstInitRef.current = true; }
    }, [initialBSTRoot]);
    useEffect(() => {
        if (!btInitRef.current && initialBTRoot) { setBTRoot(initialBTRoot); btInitRef.current = true; }
    }, [initialBTRoot]);

    // reset on clear
    const prevLenRef = useRef(currentNodes.length);
    useEffect(() => {
        const prev = prevLenRef.current;
        prevLenRef.current = currentNodes.length;
        if (prev > 0 && currentNodes.length === 0) {
            setBSTRoot(null);
            setBTRoot(null);
        }
    });

    const Sample = [{ number: "3" }, { number: "67" }, { number: "46" }];

    const avlRoot = useMemo((): AVLTreeNode | null => {
        if (currentNodes.length === 0) return null;
        const numericNodes = currentNodes.filter(n => !isNaN(parseInt(n.data.label)));
        if (numericNodes.length === 0) return null;

        // Rebuild AVL tree from current nodes to ensure structure is valid
        const rebuilt = rebuildAVLTreeFromNodes(numericNodes);
        if (!validateTreeStructure(numericNodes, rebuilt)) return rebuilt;
        return rebuilt;
    }, [currentNodes]);

    // Animation callbacks
    const animationCallbacks: AnimationCallbacks = useMemo(() => ({
        setNodes,
        setEdges,
        setDescription: setAnimationDescription,
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
                highlightedEdges: edges.map((e: RFEdge) => ({
                    ...e,
                    style: highlightedEdgeIds.has(e.id)
                        ? { stroke: resolvedEdgeColor, strokeWidth: 3 }
                        : { stroke: '#999', strokeWidth: 2 },
                })),
            };
        },
    }), [setNodes, setEdges]);

    // AVL Handlers
    const handleAVLInsert = useAVLInsertHandler({ avlRoot, nodeIdCounter, animationSpeed, rf, animationCallbacks, isPausedRef, setIsAnimating, setAnimationDescription, setNodeIdCounter });
    const handleAVLSearch = useAVLSearchHandler({ avlRoot, animationSpeed, rf, animationCallbacks, isPausedRef, setIsAnimating, setSearchValue });
    const handleAVLRemove = useAVLRemoveHandler({ avlRoot, animationSpeed, rf, animationCallbacks, isPausedRef, setIsAnimating, setRemoveValue });
    const handleAVLRebalance = useAVLRebalanceHandler({ avlRoot, rf, animationCallbacks, isPausedRef, setIsAnimating });

    // BST Handlers
    const { handleInsert: bstInsert } = useBSTInsertHandler({ bstRoot, setBSTRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: setAnimationDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef });
    const { handleSearch: bstSearch } = useBSTSearchHandler({ bstRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: setAnimationDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef });
    const { handleRemove: bstRemove } = useBSTRemoveHandler({ bstRoot, setBSTRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: setAnimationDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef });

    // BT Handlers
    const { handleInsert: btInsert } = useBTInsertHandler({ btRoot, setBTRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: setAnimationDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef });
    const { handleSearch: btSearch } = useBTSearchHandler({ btRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: setAnimationDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef });
    const { handleRemove: btRemove } = useBTRemoveHandler({ btRoot, setBTRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: setAnimationDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef });
    const { handleInorder, handlePreorder, handlePostorder } = useBTTraversalHandler({ btRoot, nodes: rf.getNodes(), edges: rf.getEdges(), setNodes, setEdges, setDescription: setAnimationDescription, applyHighlighting: animationCallbacks.applyHighlighting, animationSpeed, isPausedRef, setIsAnimating });

    useEffect(() => { onRebalanceReady?.(handleAVLRebalance); }, [handleAVLRebalance, onRebalanceReady]);

    // Drag & Drop
    const createAddNewNode = useCallback(
        (sampleValue: number): OnDropAction => {
            return ({ position }: { position: XYPosition }) => {
                if (tutorialMode && tutorialStep === 0) {
                    const dx = position.x - GLOW_ZONE.x;
                    const dy = position.y - GLOW_ZONE.y;
                    if (Math.sqrt(dx * dx + dy * dy) > GLOW_ZONE.radius) return;
                }
                const newNode = {
                    id: getId(), type: "custom", position,
                    data: { label: sampleValue.toString(), variant: "circle" },
                    zIndex: tutorialMode ? 100 : undefined,
                };
                setNodes(nds => nds.concat(newNode));
                setType(null);

                if (isBST) setBSTRoot(prev => insertBST(cloneBSTTree(prev), sampleValue, newNode.id));
                if (isBT) setBTRoot(prev => insertBT(cloneBT(prev), sampleValue, newNode.id));

                if (tutorialMode && tutorialStep === 0) onTutorialDropSuccess?.();
            };
        },
        [setNodes, tutorialMode, tutorialStep, onTutorialDropSuccess, isBST, isBT]
    );

    // Handle insert operation
    const handleInsert = useCallback(() => {
        if (tutorialMode) return;
        const v = inputValue ? parseInt(inputValue) : Math.floor(Math.random() * 100) + 1;
        if (isNaN(v)) return;
        if (algorithm === 'avl-tree') handleAVLInsert(v);
        else if (isBST) bstInsert(v);
        else if (isBT) btInsert(v);
        else console.warn(`Insert not implemented for ${algorithm}`);
        setInputValue('');
    }, [tutorialMode, inputValue, algorithm, isBST, isBT, handleAVLInsert, bstInsert, btInsert]);

    // Handle search operation
    const handleSearch = useCallback(() => {
        if (tutorialMode) return;
        const v = searchValue ? parseInt(searchValue) : NaN;
        if (isNaN(v)) return;
        if (algorithm === 'avl-tree') handleAVLSearch(v);
        else if (isBST) bstSearch(v);
        else if (isBT) btSearch(v);
        else console.warn(`Search not implemented for ${algorithm}`);
    }, [tutorialMode, searchValue, algorithm, isBST, isBT, handleAVLSearch, bstSearch, btSearch]);

    // Handle remove operation
    const handleRemove = useCallback(() => {
        if (tutorialMode) return;
        const v = removeValue ? parseInt(removeValue) : NaN;
        if (isNaN(v)) return;
        if (algorithm === 'avl-tree') handleAVLRemove(v);
        else if (isBST) bstRemove(v);
        else if (isBT) btRemove(v);
        else console.warn(`Remove not implemented for ${algorithm}`);
    }, [tutorialMode, removeValue, algorithm, isBST, isBT, handleAVLRemove, bstRemove, btRemove]);

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

    // Handle reset operation
    const handleReset = useCallback(() => {
        if (tutorialMode) return;
        setInputValue(''); setSearchValue(''); setRemoveValue('');
        setBSTRoot(null); setBTRoot(null);
    }, [tutorialMode]);

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
                <div className="transition-all duration-300 ease-in-out overflow-x-auto flex gap-2 mb-2 p-2">
                    {Sample.map((item, index) => (
                        <div
                            key={index}
                            className="shrink-0 w-16 h-16 rounded-full flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] cursor-grab bg-[#D9E363]"
                            data-tutorial-target={item.number === "3" ? "sidebar-node-3" : undefined}
                            onPointerDown={(event) => {
                                setType("custom");
                                setDraggedValue(parseInt(item.number));
                                onDragStart(event, createAddNewNode(parseInt(item.number)));
                            }}
                        >
                            {item.number}
                        </div>
                    ))}
                </div>

                <div className={`flex-col justify-center items-center text-center ${tutorialMode ? "pointer-events-none opacity-60" : ""}`}>

                    {/* Traversal Buttons (เฉพาะ bt-* algorithms) */}
                    {hasTraversal && (
                        <div className="grid-cols-1 grid gap-2 text-start m-1">
                            <p className="font-bold text-md">Traversal</p>
                            <div className="flex gap-2">
                                {traversalType === 'binary-tree-inorder' && (
                                    <button
                                        className="flex-1 bg-[#222121] text-white rounded-lg p-2 text-sm font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors"
                                        onClick={handleInorder}
                                        disabled={isAnimating}
                                        title="Left → Root → Right"
                                    >
                                        Traversal Inorder
                                    </button>
                                )}
                                {traversalType === 'binary-tree-preorder' && (
                                    <button
                                        className="flex-1 bg-[#222121] text-white rounded-lg p-2 text-sm font-semibold disabled:opacity-50 hover:bg-yellow-600 transition-colors"
                                        onClick={handlePreorder}
                                        disabled={isAnimating}
                                        title="Root → Left → Right"
                                    >
                                        Traversal Preorder
                                    </button>
                                )}
                                {traversalType === 'binary-tree-postorder' && (
                                    <button
                                        className="flex-1 bg-[#222121] text-white rounded-lg p-2 text-sm font-semibold disabled:opacity-50 hover:bg-red-600 transition-colors"
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
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <button
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
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                disabled={isAnimating}
                            />
                            <button
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
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={removeValue}
                                onChange={(e) => setRemoveValue(e.target.value)}
                                disabled={isAnimating}
                            />
                            <button
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