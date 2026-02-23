"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useReactFlow, XYPosition, Node } from "@xyflow/react";
// Ensure these custom hooks/components are correctly exported from your files
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";

let id = 0;
const getId = () => `dndnode_${id++}`;

type nodeProps = {
    nodeInput: number;
    /* `setNodeInput: React.Dispatch<React.SetStateAction<number>>;` is a prop declaration in the
    `nodeProps` interface. It defines a function that can be used to update the state of `nodeInput`
    in a React component. */
    setNodeInput: React.Dispatch<React.SetStateAction<number>>;
};

function Data_sort({ nodeInput, setNodeInput }: nodeProps) {
    const [isDataSortOpen, setIsDataSortOpen] = useState(false);
    const { setNodes } = useReactFlow();
    const { onDragStart, isDragging } = useDnD();
    const [type, setType] = useState<string | null>(null);
    const [draggedValue, setDraggedValue] = useState<number | null>(null);

    const createAddNewNode = useCallback(
        (sampleValue: number): OnDropAction => {
            return ({ position }: { position: XYPosition }) => {
                setNodes((prev) => {
                    const currentIndex = prev.length; // index ใหม่ = ต่อท้าย

                    const newNode: Node = {
                        id: getId(),
                        type: "custom",
                        position, // ตำแหน่งเมาส์ตอนวาง 
                        data: {
                            value: sampleValue,
                            status: "idle",
                            index: currentIndex,
                        },
                    };

                    return prev.concat(newNode);
                });

                setType(null);
                setDraggedValue(null);
            };
        },
        [setNodes],
    );

    const Sample = [
        { number: "1" },
        { number: "2" },
        { number: "3" },
        { number: "4" },
        { number: "5" },
    ];

    return (
        <>
            {/* Ghost node following the pointer */}
            {isDragging && <DragGhost type={type} value={draggedValue} />}

            <button
                className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${isDataSortOpen ? "bg-gray-200 h-12" : "bg-white"
                    }`}
                onClick={() => setIsDataSortOpen(!isDataSortOpen)}
            >
                <div className="flex items-center">
                    <div
                        className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? "" : "hidden opacity-0"
                            }`}
                    ></div>
                    <div className={`flex text-lg p-2`}>Data Sort</div>
                </div>
                <div className="mr-2 flex justify-end">
                    {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>

            <div
                className={`flex-col transition-opacity duration-300 ${isDataSortOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
                    }`}
            >
                <div className="overflow-x-auto flex gap-2 mb-2 p-2">
                    {/* Input Node Item */}
                    <div
                        className="shrink-0 flex justify-center items-center border-2 border-[#5D5D5D] bg-[#D9E363] w-14 h-14 rounded-lg cursor-grab"
                        onPointerDown={(event) => {
                            const value = nodeInput || 0;
                            setType("input");
                            setDraggedValue(value);
                            onDragStart(event, createAddNewNode(value));
                        }}
                    >
                        <input
                            type="number"
                            placeholder="0"
                            className="w-10 h-full rounded-lg bg-transparent text-center text-[#222121] font-semibold text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={nodeInput}
                            onChange={(e) => setNodeInput(parseInt(e.target.value) || 0)}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking input
                        />
                    </div>

                    {/* Sample Node Items */}
                    {Sample.map((item, index) => (
                        <div
                            key={index}
                            className="shrink-0 w-14 h-14 rounded-lg flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] bg-[#D9E363] cursor-grab"
                            onPointerDown={(event) => {
                                const value = parseInt(item.number);
                                setType("custom"); // Changed drag ghost type to "custom"
                                setDraggedValue(value);
                                onDragStart(event, createAddNewNode(value));
                            }}
                        >
                            {item.number}
                        </div>
                    ))}
                </div>

                <div className="flex justify-center items-center text-center p-2">
                    <RandomSize />
                </div>
            </div>
        </>
    );
}

export default Data_sort;

interface DragGhostProps {
    type: string | null;
    value: number | null;
}

export function DragGhost({ type, value }: DragGhostProps) {
    const { position } = useDnDPosition();

    if (!position || !type) return null;

    return (
        <div
            className={`fixed top-0 left-0 pointer-events-none z-1000 flex h-14 w-14 items-center justify-center rounded-lg border-2 border-[#5D5D5D] bg-[#D9E363] text-center text-2xl font-semibold text-[#222121] shadow-lg`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
            }}>
            {value}
        </div>
    );
}