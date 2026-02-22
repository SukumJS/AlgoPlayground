"use client"
import React, { useState } from 'react'
import { ChevronFirst, ChevronLast, ChevronsLeft, ChevronsRight, Play, Pause } from 'lucide-react';

type SpeedType = "1x" | "2x" | "5x";

type AlgorithmController = {
    run?: () => void;
    stop?: () => void;
    nextStep?: () => void;
    prevStep?: () => void;
    skipForward?: () => void;
    skipBack?: () => void;
    setSpeed?: (speed: SpeedType) => void;
    isRunning?: boolean;
    speed?: SpeedType;
};

type ControlPanelProps = {
    controller: AlgorithmController;
};


function ControlPanel({ controller }: ControlPanelProps) {


    return (
        <div className='flex justify-center'>
            <div className='w-152.5 h-27.5 rounded-lg shadow-lg border border-gray-300 bg-white flex flex-col px-4 items-center justify-center'>
                {/* Play, Pause & Speed Line */}
                <div className='flex flex-row gap-2 items-center mb-2'>
                    <div className='flex gap-2 items-center'>
                        <p className='font-semibold text-sm'>Auto Execution</p>
                        <button type="button" className={`w-28.25 h-10 p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center ${controller.isRunning ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                            onClick={controller.run}
                        >
                            <Play fill={controller.isRunning ? 'white' : 'black'} />
                            Run
                        </button>
                        <button type="button" className={`w-28.25 h-10 p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center ${!controller.isRunning ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                            onClick={controller.stop}
                        >
                            <Pause fill={!controller.isRunning ? 'white' : 'black'} />
                            Stop
                        </button>
                    </div>

                    {/* Speed Limit for Algo */}
                    <div className='flex gap-2 items-center'>
                        <p className='font-semibold text-sm'>Speed</p>
                        <button type="button" className={`w-auto h-10 p-2 border border-gray-300 rounded-lg ${controller.speed === '1x' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                            onClick={() => {
                                controller.setSpeed?.("1x");
                            }}
                        >
                            1x
                        </button>
                        <button type="button" className={`w-auto h-10 p-2 border border-gray-300 rounded-lg ${controller.speed === '2x' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                            onClick={() => {
                                controller.setSpeed?.("2x");
                            }}>
                            2x
                        </button>
                        <button type="button" className={`w-auto h-10 p-2 border border-gray-300 rounded-lg ${controller.speed === '5x' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                            onClick={() => {
                                controller.setSpeed?.("5x");
                            }}>
                            5x
                        </button>
                    </div>

                </div>

                {/* Button for show algo step by step line */}
                <div className='flex flex-row gap-2'>
                    <button onClick={controller.prevStep}type="button" className='w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                        <ChevronFirst />
                        Prev Step
                    </button>
                    <button onClick={controller.nextStep} type="button" className='w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                        Next Step
                        <ChevronLast />
                    </button>
                    <button onClick={controller.skipBack} type="button" className='w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                        <ChevronsLeft />
                        Skip Back
                    </button>
                    <button onClick={controller.skipForward} type="button" className='w-35.5 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'>
                        Skip Forward
                        <ChevronsRight />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ControlPanel