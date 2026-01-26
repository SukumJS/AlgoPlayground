"use client";

import { ChevronDown,ChevronUp } from 'lucide-react';
import React, { useState, useCallback, useRef }from 'react'
import { useReactFlow, XYPosition } from '@xyflow/react';
import { OnDropAction, useDnD, useDnDPosition } from './useDnD';
import RandomSize from '../shared/randomSize';
import { Plus, Search, Trash } from 'lucide-react';

let id = 0;
const getId = () => `dndnode_${id++}`;

function Data_tree() {
    const [isDataSortOpen, setIsDataSortOpen] = useState(false);
    const { onDragStart, isDragging } = useDnD();
    // The type of the node that is being dragged.
    const [type, setType] = useState<string | null>(null);
    const { setNodes } = useReactFlow();
    const [inputValue, setInputValue] = useState<string>('');

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
    
        const handleInsert = () => {
            const randomNum = Math.floor(Math.random() * 30) + 1;
            setInputValue(randomNum.toString());
        };
    
        const handleReset = () => {
            setInputValue('');
        };

    return (
        <>
            {/* The ghost node will be rendered at pointer position when dragging. */}
            {isDragging && <DragGhost type={type} />}
            <button className={`border-b border-black flex items-center justify-between w-full transition-all duration-300 ease-in-out ${isDataSortOpen ? 'bg-gray-200 h-12' : 'bg-white'}`} onClick={() => setIsDataSortOpen(!isDataSortOpen)}>
                <div className="flex items-center">
                <div className={`bg-blue-600 w-2 h-12 transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? '' : 'hidden opacity-100'}`}></div>
                <div className={`flex text-lg p-2`}>
                    Data Tree
                </div>
                </div>
                <div className='mr-4 flex justify-end'>
                    {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>
            <div className='flex-col'>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-wrap justify-between ${isDataSortOpen ? 'opacity-100' : 'opacity-0'}`}>
                    {sample.map((item, index) => (
                        <div
                            key={index}
                            className="flex justify-center items-center text-center text-[#222121] font-semibold text-2xl border-2 border-[#5D5D5D] bg-[#D9E363] w-14 h-14 rounded-lg"
                            onPointerDown={(event) => {
                                setType('input');
                                onDragStart(event, createAddNewNode('input'));
                            }}
                        >
                            {item.number}
                        </div>
                    ))}
                        <div className='flex-col justify-center items-center text-center'>
                            <div className='grid-cols-1 grid gap-2 text-start m-1'>
                                <p className='font-bold text-md'>Insert</p>
                                <div className='flex gap-2'>
                                    <input type="number" className='border border-gray-200 p-2 rounded-lg w-80' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                                    <button className='bg-[#222121] rounded-lg p-2' onClick={handleInsert}>
                                        <Plus color='white'/>
                                    </button>
                                </div>
                            </div>
                            <div className='grid-cols-1 grid gap-2 text-start m-1'>
                                <p className='font-bold text-md'>Search</p>
                                <div className='flex gap-2'>
                                    <input type="number" className='border border-gray-200 p-2 rounded-lg w-80' />
                                    <button className='bg-[#222121] rounded-lg p-2'>
                                        <Search color='white'/>
                                    </button>
                                </div>
                            </div>
                            <div className='grid-cols-1 grid gap-2 text-start m-1'>
                                <p className='font-bold text-md'>Remove</p>
                                <div className='flex gap-2'>
                                    <input type="number" className='border border-gray-200 p-2 rounded-lg w-80' />
                                    <button className='bg-[#E82B2B] rounded-lg p-2'>
                                        <Trash color='white'/>
                                    </button>
                                </div>
                            </div>
                            <RandomSize />
                        </div>
                </div>
            </div>
        </>
    )
}

export default Data_tree

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