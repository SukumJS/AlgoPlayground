"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import controlBus from '@/src/hooks/controlBus';
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useReactFlow, XYPosition } from "@xyflow/react";
import type { Node as RFNode } from '@xyflow/react';
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";
import { Plus, Search, Trash } from "lucide-react";
import { GLOW_ZONE } from "./tutorial_tree";
import { 
  rebuildAVLTreeFromNodes, 
  validateTreeStructure,
  type AVLTreeNode 
} from "@/src/hooks/treeAdapters/avlAdapter";
import { type AnimationCallbacks } from "@/src/components/algorithms/AVLtree/index";

import { useAVLInsertHandler } from "@/src/hooks/avlTree/useAVLInsertHandler";
import { useAVLSearchHandler } from "@/src/hooks/avlTree/useAVLSearchHandler";
import { useAVLRemoveHandler } from "@/src/hooks/avlTree/useAVLRemoveHandler";


let id = 0;
const getId = () => `dndnode_${id++}`;

interface Data_treeProps {
    tutorialMode?: boolean;
    tutorialStep?: number;
    onTutorialDropSuccess?: () => void;
    currentNodes?: Array<{ id: string; data: { label: string } }>;
    algorithm?: string;
}

function Data_tree({ 
  tutorialMode = false, 
  tutorialStep = 0, 
  onTutorialDropSuccess, 
  currentNodes = [],
  algorithm,
}: Data_treeProps) {
    const [isDataSortOpen, setIsDataSortOpen] = useState(true);
    const { onDragStart, isDragging } = useDnD();
    const [type, setType] = useState<string | null>(null);
    const rf = useReactFlow();
    const { setNodes, setEdges } = rf;
    
    // Input states
    const [inputValue, setInputValue] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const [removeValue, setRemoveValue] = useState<string>("");
    const [draggedValue, setDraggedValue] = useState<number | null>(null);
    const [nodeIdCounter, setNodeIdCounter] = useState(5);
    
    // Animation states
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(500); // ms per step
    const [animationDescription, setAnimationDescription] = useState<string>("");
    const isPausedRef = useRef<boolean>(false);

    // Sample nodes for tutorial
    const Sample = [
        { number: "3" },
        { number: "67" },
        { number: "46" },
    ];

    // Get current AVL tree root from ReactFlow nodes
    const avlRoot = useMemo((): AVLTreeNode | null => {
        if (currentNodes.length === 0) return null;

        // Filter only nodes with numeric labels
        const numericNodes = currentNodes.filter(node => 
          !isNaN(parseInt(node.data.label))
        );
        
        if (numericNodes.length === 0) return null;

        // Rebuild AVL tree from current nodes to ensure structure is valid
        const rebuilt = rebuildAVLTreeFromNodes(numericNodes);
        
        // Verify structure is valid
        if (!validateTreeStructure(numericNodes, rebuilt)) {
            console.warn("Tree structure invalid, rebuilding...");
            return rebuilt;
        }

        return rebuilt;
    }, [currentNodes]);

    // Animation callbacks
    const animationCallbacks: AnimationCallbacks = useMemo(() => ({
        setNodes,
        setEdges,
        setDescription: setAnimationDescription,
        applyHighlighting: (nodes, edges, highlightedNodeIds, highlightedEdgeIds, color) => {
            const highlightedNodes = nodes.map((node: any) => ({
                ...node,
                data: {
                    ...node.data,
                    isHighlighted: highlightedNodeIds.has(node.id),
                    highlightColor: highlightedNodeIds.has(node.id) ? color : undefined,
                },
            }));
            
            const highlightedEdges = edges.map((edge: any) => ({
                ...edge,
                style: highlightedEdgeIds.has(edge.id)
                    ? { 
                        stroke: color === 'red' ? '#EF4444' 
                              : color === 'blue' ? '#3B82F6' 
                              : color === 'yellow' ? '#FBBF24' 
                              : '#22C55E', 
                        strokeWidth: 3 
                      }
                    : { stroke: '#999', strokeWidth: 2 },
            }));
            
            return { highlightedNodes, highlightedEdges };
        },
    }), [setNodes, setEdges]);

    const handleAVLInsert = useAVLInsertHandler({
        avlRoot,
        nodeIdCounter,
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setAnimationDescription,
        setNodeIdCounter
    });

    const handleAVLSearch = useAVLSearchHandler({
        avlRoot,
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setSearchValue
    });

    const handleAVLRemove = useAVLRemoveHandler({
        avlRoot,
        animationSpeed,
        rf,
        animationCallbacks,
        isPausedRef,
        setIsAnimating,
        setRemoveValue
    });

    // Create drag and drop handler for tutorial
    const createAddNewNode = useCallback(
        (Sample: number): OnDropAction => {
            return ({ position }: { position: XYPosition }) => {
                // During tutorial step 1, only allow drop in glow zone area
                if (tutorialMode && tutorialStep === 0) {
                    // Use GLOW_ZONE constant for consistency
                    const glowCenterX = GLOW_ZONE.x;
                    const glowCenterY = GLOW_ZONE.y;
                    const allowedRadius = GLOW_ZONE.radius;

                    const dx = position.x - glowCenterX;
                    const dy = position.y - glowCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > allowedRadius) {
                        return; // Drop outside glow zone
                    }
                }

                const newNode = {
                    id: getId(),
                    type: "custom",
                    position,
                    data: { label: Sample.toString(), variant: "circle" },
                    // Higher z-index during tutorial so node 3 appears above others
                    zIndex: tutorialMode ? 100 : undefined,
                };

                setNodes((nds) => nds.concat(newNode));
                setType(null);

                // During tutorial step 1, advance to next step after successful drop
                if (tutorialMode && tutorialStep === 0) {
                    onTutorialDropSuccess?.();
                }
            };
        },
        [setNodes, setType, tutorialMode, tutorialStep, onTutorialDropSuccess],
    );

    // Handle insert operation
    const handleInsert = useCallback(() => {
        if (tutorialMode) return;

        const valueToInsert = inputValue
            ? parseInt(inputValue)
            : Math.floor(Math.random() * 100) + 1;
        if (isNaN(valueToInsert)) return;

        if (algorithm === "avl") {
            handleAVLInsert(valueToInsert);
        } else {
            console.warn(`Insert not implemented for ${algorithm}`);
        }

        setInputValue("");
    }, [tutorialMode, inputValue, algorithm, handleAVLInsert]);


    const handleSearch = useCallback(() => {
        if (tutorialMode) return;

        const value = searchValue ? parseInt(searchValue) : NaN;
        if (isNaN(value)) return;

        if (algorithm === "avl") {
            handleAVLSearch(value);
        } else {
            console.warn(`Search not implemented for ${algorithm}`);
        }
    }, [tutorialMode, searchValue, algorithm, handleAVLSearch]);


    const handleRemove = useCallback(() => {
        if (tutorialMode) return;

        const value = removeValue ? parseInt(removeValue) : NaN;
        if (isNaN(value)) return;

        if (algorithm === "avl") {
            handleAVLRemove(value);
        } else {
            console.warn(`Remove not implemented for ${algorithm}`);
        }
    }, [tutorialMode, removeValue, algorithm, handleAVLRemove]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (tutorialMode) return;
        setInputValue("");
        setSearchValue("");
        setRemoveValue("");
    }, [tutorialMode]);

    // Toggle expand/collapse
    const handleToggle = useCallback(() => {
        if (tutorialMode) return;
        setIsDataSortOpen(!isDataSortOpen);
    }, [tutorialMode, isDataSortOpen]);

    // Subscribe to control bus events
    useEffect(() => {
        const unsubSpeed = controlBus.subscribe('setSpeed', (ms?: number) => {
            if (typeof ms === 'number') setAnimationSpeed(ms);
        });

        const unsubStop = controlBus.subscribe('stop', () => {
            isPausedRef.current = true;
            setIsAnimating(false);
            setAnimationDescription('Paused');
        });

        const unsubRun = controlBus.subscribe('run', () => {
            isPausedRef.current = false;
        });

        return () => {
            unsubSpeed();
            unsubStop();
            unsubRun();
        };
    }, []);

    return (
        <>
            {/* Ghost node when dragging */}
            {isDragging && <DragGhost type={type} value={draggedValue} />}

            {/* Header button */}
            <button
                className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
                    isDataSortOpen ? "bg-gray-200 h-12" : "bg-white"
                } ${tutorialMode ? "cursor-default" : ""}`}
                onClick={handleToggle}
            >
                <div className="flex items-center">
                    <div
                        className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${
                            isDataSortOpen ? "" : "hidden opacity-100"
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

                {/* Form controls - visible but disabled during tutorial */}
                <div className={`flex-col justify-center items-center text-center ${tutorialMode ? 'pointer-events-none opacity-60' : ''}`}>
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