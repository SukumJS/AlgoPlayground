"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useCallback, useRef } from "react";
import { useReactFlow, XYPosition } from "@xyflow/react";
import { OnDropAction, useDnD, useDnDPosition } from "./useDnD";
import RandomSize from "../shared/randomSize";
import { Plus, Search, Trash } from "lucide-react";

let id = 0;
const getId = () => `dndnode_${id++}`;

function Data_tree() {
    const [isDataSortOpen, setIsDataSortOpen] = useState(false);
    const { onDragStart, isDragging } = useDnD();
    // The type of the node that is being dragged.
    const [type, setType] = useState<string | null>(null);
    const { setNodes } = useReactFlow();
    const [inputValue, setInputValue] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const [removeValue, setRemoveValue] = useState<string>("");
    const [nodeInput, setNodeInput] = useState<string>("");

    const Sample = [
        { number: "1" },
        { number: "2" },
        { number: "3" },
        { number: "4" },
        { number: "5" },
    ];

    const createAddNewNode = useCallback(
        (Sample: number): OnDropAction => {
        return ({ position }: { position: XYPosition }) => {
            // Here, we create a new node and add it to the flow.
            // You can customize the behavior of what happens when a node is dropped on the flow here.
            const newNode = {
            id: getId(),
            type: "default",
            position,
            data: { label: `${Sample}` },
            };

            setNodes((nds) => nds.concat(newNode));
            setType(null);
        };
        },
        [setNodes, setType],
    );

    //random number in insert tree data
    const handleInsert = () => {
        const randomNum = Math.floor(Math.random() * 100) + 1;
        setInputValue(randomNum.toString());
    };

    //reset all of value in input data
    const handleReset = () => {
        setInputValue("");
        setSearchValue("");
        setRemoveValue("");
    };

    return (
        <>
        {/* The ghost node will be rendered at pointer position when dragging. */}
        {isDragging && <DragGhost type={type} />}
        <button
            className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${isDataSortOpen ? "bg-gray-200 h-12" : "bg-white"}`}
            onClick={() => setIsDataSortOpen(!isDataSortOpen)}
        >
            <div className="flex items-center">
            <div
                className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? "" : "hidden opacity-100"}`}
            ></div>
            <div className={`flex text-lg p-2`}>Data Tree</div>
            </div>
            <div className="mr-2 flex justify-end">
            {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
            </div>
        </button>

        {/* map drag and drop data */}
        <div
            className={`flex-col ${isDataSortOpen ? "opacity-100" : "opacity-0"}`}
        >
            <div
            className={`transition-all duration-300 ease-in-out overflow-x-auto flex gap-2 mb-2`}
            >
            <div
                className="shrink-0 flex justify-center items-center border-2 border-[#5D5D5D] bg-[#D9E363] w-14 h-14 rounded-lg cursor-grab"
                onPointerDown={(event) => {
                setType("input");
                onDragStart(event, createAddNewNode(parseInt(nodeInput) || 0));
                }}
            >
                <input
                type="number"
                placeholder="0"
                className="w-10 h-full rounded-lg bg-transparent text-center text-[#222121] font-semibold text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={nodeInput}
                onChange={(e) => setNodeInput(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                />
            </div>
            {Sample.map((item, index) => (
                <div
                key={index}
                className="shrink-0 w-14 h-14 rounded-lg flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] bg-[#D9E363]"
                onPointerDown={(event) => {
                    setType("input");
                    onDragStart(event, createAddNewNode(parseInt(item.number)));
                }}
                >
                {item.number}
                </div>
            ))}
            </div>
            <div className="flex-col justify-center items-center text-center">
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
}

// The DragGhost component is used to display a ghost node when dragging a node into the flow.
export function DragGhost({ type }: DragGhostProps) {
    const { position } = useDnDPosition();

    if (!position) return null;

    return (
        <div
        className="flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] bg-[#D9E363] w-14 h-14 rounded-lg opacity-80"
        style={{
            transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
            position: "fixed",
            pointerEvents: "none",
            zIndex: 1000,
        }}
        ></div>
    );
}
