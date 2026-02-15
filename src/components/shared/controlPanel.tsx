"use client"
import React, { useState } from 'react'
import controlBus from '@/src/hooks/controlBus';
import { ChevronFirst, ChevronLast, ChevronsLeft, ChevronsRight, Play, Pause } from 'lucide-react';



function ControlPanel() {
    const [activeExecution, setActiveExecution] = useState<string | null>('stop');
    const [activeSpeed, setActiveSpeed] = useState<string | null>('1x');

    return (
    <div className='flex justify-center'>
        <div className='w-152.5 h-27.5 rounded-lg shadow-lg border border-gray-300 bg-white flex flex-col px-4 items-center justify-center'>
            {/* Play, Pause & Speed Line */}
            <div className='flex flex-row gap-2 items-center mb-2'>
                <div className='flex gap-2 items-center'>
                    <p className='font-semibold text-sm'>Auto Execution</p>
                    <button type="button" className={`w-28.25 h-10 p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center ${activeExecution === 'run' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => { setActiveExecution('run'); controlBus.emit('run'); }}
                    >
                        <Play fill={activeExecution === 'run' ? 'white' : 'black'} />
                        Run
                    </button>
                    <button type="button" className={`w-28.25 h-10 p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center ${activeExecution === 'stop' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => { setActiveExecution('stop'); controlBus.emit('stop'); }}
                    >
                        <Pause fill={activeExecution === 'stop' ? 'white' : 'black'} />
                        Stop
                    </button>
                </div>
                
                {/* Speed Limit for Algo */}
                <div className='flex gap-2 items-center'>
                    <p className='font-semibold text-sm'>Speed</p>
                    <button type="button" className={`w-auto h-10 p-2 border border-gray-300 rounded-lg ${activeSpeed === '1x' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => { setActiveSpeed('1x'); controlBus.emit('setSpeed', 500); }}>
                        1x
                    </button>
                    <button type="button" className={`w-auto h-10 p-2 border border-gray-300 rounded-lg ${activeSpeed === '2x' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => { setActiveSpeed('2x'); controlBus.emit('setSpeed', 250); }}>
                        2x
                    </button>
                    <button type="button" className={`w-auto h-10 p-2 border border-gray-300 rounded-lg ${activeSpeed === '5x' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={() => { setActiveSpeed('5x'); controlBus.emit('setSpeed', 100); }}>
                        5x
                    </button>
                </div>
                
            </div>

            {/* Button for show algo step by step line */}
            <div className='flex flex-row gap-2'>
                <button type="button" className='w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'
                onClick={() => controlBus.emit('prevStep')}>
                    <ChevronFirst />
                    Prev Step
                </button>
                <button type="button" className='w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'
                onClick={() => controlBus.emit('confirmInsert')}>
                    Next Step
                    <ChevronLast />
                </button>
                <button type="button" className='w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                    <ChevronsLeft />
                    Skip Back
                </button>
                <button type="button" className='w-35.5 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                    Skip Forward
                    <ChevronsRight />
                </button>
            </div>
        </div>
    </div>
    )
}

export default ControlPanel