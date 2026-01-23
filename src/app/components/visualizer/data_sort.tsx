"use client";

import { ChevronDown,ChevronUp } from 'lucide-react';
import React, { useState, useCallback, useRef }from 'react'
import { useReactFlow, XYPosition } from '@xyflow/react';
import { OnDropAction, useDnD, useDnDPosition } from './useDnD';

let id = 0;
const getId = () => `dndnode_${id++}`;

function Data_sort() {
    const [isDataSortOpen, setIsDataSortOpen] = useState(false);
    const [parent, setParent] = useState(null);
    const { onDragStart, isDragging } = useDnD();
    // The type of the node that is being dragged.
    const [type, setType] = useState<string | null>(null);
    const { setNodes } = useReactFlow();

    const createAddNewNode = useCallback(
        (nodeType: string): OnDropAction => {
            return ({ position }: { position: XYPosition }) => {
            // Here, we create a new node and add it to the flow.
            // You can customize the behavior of what happens when a node is dropped on the flow here.
            const newNode = {
                id: getId(),
                type: nodeType,
                position,
                data: { label: `${nodeType} node` },
            };

            setNodes((nds) => nds.concat(newNode));
            setType(null);
            };
        },
        [setNodes, setType],
    );

    const sample = [
        { number: '1' },
        { number: '2' },
        { number: '3' },
        { number: '4' },
        { number: '5' },
    ]
    return (
        <>
            {/* The ghost node will be rendered at pointer position when dragging. */}
            {isDragging && <DragGhost type={type} />}
            <div className='border-b border-black flex'>
                <div className={`bg-blue-600 w-2 h-12 ${isDataSortOpen ? '' : 'hidden'}`}></div>
                <div className={`flex text-lg p-2 justify-between transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? 'bg-gray-200 h-12' : 'bg-white'}`} onClick={() => setIsDataSortOpen(!isDataSortOpen)}>
                    Data Sort
                    {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </div>
            <div className="description">
                You can drag these nodes to the pane to create new nodes.
            </div>
            <div
                className="dndnode input"
                onPointerDown={(event) => {
                    setType('input');
                    onDragStart(event, createAddNewNode('input'));
                }}
                >
                Input Node
            </div>
            <div
                className="dndnode"
                onPointerDown={(event) => {
                    setType('default');
                    onDragStart(event, createAddNewNode('default'));
                }}
                >
                Default Node
            </div>
            <div
                className="dndnode output"
                onPointerDown={(event) => {
                    setType('output');
                    onDragStart(event, createAddNewNode('output'));
                }}
                >
                Output Node
            </div>
        </>
        // <div className='border-b border-black'>
        //     <div className={`flex text-lg p-2 justify-between transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? 'bg-gray-200 mb-4' : ''}`} onClick={() => setIsDataSortOpen(!isDataSortOpen)}>
        //         Data Sort
        //         {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
        //     </div>

        //     <div 
        //     className={`transition-all duration-300 ease-in-out ${
        //     isDataSortOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        //     } overflow-hidden px-2`}>
        //         <div className="pb-4">
        //             <div className='flex gap-2 overflow-auto'>
        //                 {sample.map((item, index) => (
        //                     <div key={index} className='
        //                     flex border border-black 
        //                     w-14 h-14 rounded-lg 
        //                     justify-center items-center bg-[#D9E363] font-semibold'
        //                     >
        //                         {item.number}
        //                     </div>
        //                 ))}
        //             </div>
        //         </div>
        //     </div>
        // </div>
    )
}

export default Data_sort

interface DragGhostProps {
    type: string | null;
}

// The DragGhost component is used to display a ghost node when dragging a node into the flow.
export function DragGhost({ type }: DragGhostProps) {
    const { position } = useDnDPosition();
    
    if (!position) return null;
    
    return (
        <div
        className={`dndnode ghostnode ${type}`}
        style={{
            transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
        }}
        >
        {type && `${type.charAt(0).toUpperCase() + type.slice(1)} Node`}
        </div>
    );
}