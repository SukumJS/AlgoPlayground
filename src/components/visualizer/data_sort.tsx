"use client";

import { ChevronDown,ChevronUp } from 'lucide-react';
import React, { useState }from 'react'

function Data_sort() {
    const [isDataSortOpen, setIsDataSortOpen] = useState(false);
    const [parent, setParent] = useState(null);

    const sample = [
        { number: '1' },
        { number: '2' },
        { number: '3' },
        { number: '4' },
        { number: '5' },
    ]
    return (
        <div className='border-b border-black'>
            <div className={`flex text-lg p-2 justify-between transition-all duration-300 ease-in-out z-50 ${isDataSortOpen ? 'bg-gray-200 mb-4' : ''}`} onClick={() => setIsDataSortOpen(!isDataSortOpen)}>
                Data Sort
                {isDataSortOpen ? <ChevronUp /> : <ChevronDown />}
            </div>

            <div 
            className={`transition-all duration-300 ease-in-out ${
            isDataSortOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden px-2`}>
                <div className="pb-4">
                    <div className='flex gap-2 overflow-auto'>
                        {sample.map((item, index) => (
                            <div key={index} className='
                            flex border border-black 
                            w-14 h-14 rounded-lg 
                            justify-center items-center bg-[#D9E363] font-semibold'
                            >
                                {item.number}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Data_sort