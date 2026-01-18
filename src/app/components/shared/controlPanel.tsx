"use client"
import React, { useState } from 'react'
import { ChevronFirst, ChevronLast, ChevronsLeft, ChevronsRight, Play, Pause } from 'lucide-react';



function ControlPanel() {
    const [activeExecution, setActiveExecution] = useState<string | null>('stop');
    const [activeSpeed, setActiveSpeed] = useState<string | null>('1x');

    return (
    <div className='flex justify-center'>
        <div className='w-[610px] h-[110px] rounded-lg shadow-lg border border-gray-300 bg-white flex flex-col px-4 items-center justify-center'>
            <div className='flex flex-row gap-2'>
                <button type="button" className='w-[120px] h-[40px] p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                    <ChevronFirst />
                    Prev Step
                </button>
                <button type="button" className='w-[120px] h-[40px] p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                    Next Step
                    <ChevronLast />
                </button>
                <button type="button" className='w-[120px] h-[40px] p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                    <ChevronsLeft />
                    Skip Back
                </button>
                <button type="button" className='w-[142px] h-[40px] p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                    Skip Forward
                    <ChevronsRight />
                </button>
            </div>
            <div className='flex flex-row gap-2 items-center mt-2'>
                <div className='flex gap-2 items-center'>
                    <p className='font-semibold text-sm'>Auto Execution</p>
                    <button type="button" className={`w-[113px] h-[40px] p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center ${activeExecution === 'run' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveExecution('run')}
                    >
                        <Play fill={activeExecution === 'run' ? 'white' : 'black'} />
                        Run
                    </button>
                    <button type="button" className={`w-[113px] h-[40px] p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center ${activeExecution === 'stop' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveExecution('stop')}
                    >
                        <Pause fill={activeExecution === 'stop' ? 'white' : 'black'} />
                        Stop
                    </button>
                </div>

                <div className='flex gap-2 items-center'>
                    <p className='font-semibold text-sm'>Speed</p>
                    <button type="button" className={`w-auto h-[40px] p-2 border border-gray-300 rounded-lg ${activeSpeed === '1x' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveSpeed('1x')}>
                        1x
                    </button>
                    <button type="button" className={`w-auto h-[40px] p-2 border border-gray-300 rounded-lg ${activeSpeed === '2x' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveSpeed('2x')}>
                        2x
                    </button>
                    <button type="button" className={`w-auto h-[40px] p-2 border border-gray-300 rounded-lg ${activeSpeed === '5x' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => setActiveSpeed('5x')}>
                        5x
                    </button>
                </div>
            </div>
        </div>
    </div>
    )
}

export default ControlPanel