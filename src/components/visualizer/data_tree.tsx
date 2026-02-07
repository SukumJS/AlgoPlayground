"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useReactFlow, XYPosition } from "@xyflow/react";
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";
import { Plus, Search, Trash } from "lucide-react";
import { GLOW_ZONE } from "./tutorial_tree";

let id = 0;
const getId = () => `dndnode_${id++}`;

interface Data_treeProps {
    tutorialMode?: boolean;
    tutorialStep?: number;
    onTutorialDropSuccess?: () => void;
}

function Data_tree({ tutorialMode = false, tutorialStep = 0, onTutorialDropSuccess }: Data_treeProps) {
    const [isDataSortOpen, setIsDataSortOpen] = useState(true); // Open by default for tutorial
    const { onDragStart, isDragging } = useDnD();
    const [type, setType] = useState<string | null>(null);
    const { setNodes } = useReactFlow();
    const [inputValue, setInputValue] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const [removeValue, setRemoveValue] = useState<string>("");
    const [nodeInput, setNodeInput] = useState<string>("");
    const [draggedValue, setDraggedValue] = useState<number | null>(null);

    // Sample nodes for tutorial - node 3 is the one they should drag per Figma
    const Sample = [
        { number: "3" },
        { number: "67" },
        { number: "46" },
    ];

    // Check if drop position is valid (inside glow zone during tutorial step 1)
    const isValidDropPosition = useCallback((position: XYPosition): boolean => {
        if (!tutorialMode || tutorialStep !== 0) {
            return true; // Always valid outside tutorial step 1
        }

        // Check if position is within glow zone radius
        const dx = position.x - GLOW_ZONE.x;
        const dy = position.y - GLOW_ZONE.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= GLOW_ZONE.radius + 20; // Add some tolerance
    }, [tutorialMode, tutorialStep]);

    const createAddNewNode = useCallback(
        (Sample: number): OnDropAction => {
            return ({ position }: { position: XYPosition }) => {
                // During tutorial step 1, only allow drop in glow zone area
                if (tutorialMode && tutorialStep === 0) {
                    // Use GLOW_ZONE constant for consistency
                    const glowCenterX = GLOW_ZONE.x;
                    const glowCenterY = GLOW_ZONE.y;
                    const allowedRadius = GLOW_ZONE.radius; // Allow generous drop area

                    const dx = position.x - glowCenterX;
                    const dy = position.y - glowCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > allowedRadius) {
                        // Drop is outside glow zone - don't create node
                        return;
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

    // Random number in insert tree data
    const handleInsert = () => {
        if (tutorialMode) return; // Disabled during tutorial
        const randomNum = Math.floor(Math.random() * 100) + 1;
        setInputValue(randomNum.toString());
    };

    // Reset all values
    const handleReset = () => {
        if (tutorialMode) return; // Disabled during tutorial
        setInputValue("");
        setSearchValue("");
        setRemoveValue("");
    };

    // Toggle expand/collapse - disabled during tutorial
    const handleToggle = () => {
        if (tutorialMode) return;
        setIsDataSortOpen(!isDataSortOpen);
    };

    return (
        <>
            {/* Ghost node when dragging */}
            {isDragging && <DragGhost type={type} value={draggedValue} />}

            <button
                className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${isDataSortOpen ? "bg-gray-200 h-12" : "bg-white"} ${tutorialMode ? "cursor-default" : ""}`}
                onClick={handleToggle}
            >
                <div className="flex items-center">
                    <div
                        className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? "" : "hidden opacity-100"}`}
                    ></div>
                    <div className={`flex text-lg p-2`}>Data</div>
                </div>
                <div className="mr-2 flex justify-end">
                    {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>

            {/* Draggable nodes */}
            <div className={`flex-col ${isDataSortOpen ? "opacity-100" : "opacity-0"}`}>
                <div className={`transition-all duration-300 ease-in-out overflow-x-auto flex gap-2 mb-2 p-2`}>
                    {/* Sample nodes - all same color per Figma */}
                    {Sample.map((item, index) => (
                        <div
                            key={index}
                            className="shrink-0 w-16 h-16 rounded-full flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] cursor-grab bg-[#D9E363]"
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
                                className="bg-[#222121] rounded-lg p-2"
                                onClick={handleInsert}
                            >
                                <Plus color="white" />
                            </button>
                        </div>
                    </div>
                    <div className="grid-cols-1 grid gap-2 text-start m-1">
                        <p className="font-bold text-md">Search</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <button className="bg-[#222121] rounded-lg p-2">
                                <Search color="white" />
                            </button>
                        </div>
                    </div>
                    <div className="grid-cols-1 grid gap-2 text-start m-1">
                        <p className="font-bold text-md">Remove</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={removeValue}
                                onChange={(e) => setRemoveValue(e.target.value)}
                            />
                            <button className="bg-[#E82B2B] rounded-lg p-2">
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
            className={`fixed top-0 left-0 pointer-events-none z-1000 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#5D5D5D] bg-[#D9E363] text-center text-2xl font-semibold text-[#222121] shadow-lg`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
            }}>
            {value}
        </div>
    );
}
