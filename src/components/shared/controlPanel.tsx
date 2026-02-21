"use client"
import React from 'react'
import { ChevronFirst, ChevronLast, ChevronsLeft, ChevronsRight, Play, Pause, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
    /** Called when user clicks Run */
    onPlay?: () => void;
    /** Called when user clicks Stop / Pause */
    onPause?: () => void;
    /** Called when user clicks Prev Step */
    onPrevStep?: () => void;
    /** Called when user clicks Next Step */
    onNextStep?: () => void;
    /** Called when user clicks Skip Back (first step) */
    onSkipToStart?: () => void;
    /** Called when user clicks Skip Forward (last step) */
    onSkipToEnd?: () => void;
    /** Called when speed changes */
    onSpeedChange?: (speed: string) => void;
    /** Called when user clicks Reset */
    onReset?: () => void;
    /** External isPlaying state – keeps button highlight in sync */
    isPlaying?: boolean;
    /** Current speed label from parent */
    speed?: string;
}

function ControlPanel({
    onPlay,
    onPause,
    onPrevStep,
    onNextStep,
    onSkipToStart,
    onSkipToEnd,
    onSpeedChange,
    onReset,
    isPlaying: externalIsPlaying,
    speed: externalSpeed,
}: ControlPanelProps) {
    // Derive display state directly from props (no internal state duplication)
    const activeExecution = externalIsPlaying ? 'run' : 'stop';
    const activeSpeed = externalSpeed ?? '1x';

    const handleRun = () => {
        onPlay?.();
    };

    const handleStop = () => {
        onPause?.();
    };

    const handleSpeedChange = (spd: string) => {
        onSpeedChange?.(spd);
    };

    return (
    <div className='flex justify-center'>
        <div className='w-fit rounded-lg shadow-lg border border-gray-300 bg-white flex flex-col px-4 py-3 items-center justify-center'>
            {/* Play, Pause & Speed Line */}
            <div className='flex flex-row gap-2 items-center mb-2'>
                <div className='flex gap-2 items-center'>
                    <p className='font-semibold text-sm'>Auto Execution</p>
                    <button type="button" className={`w-28.25 h-10 p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center ${activeExecution === 'run' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={handleRun}
                    >
                        <Play fill={activeExecution === 'run' ? 'white' : 'black'} />
                        Run
                    </button>
                    <button type="button" className={`w-28.25 h-10 p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center ${activeExecution === 'stop' ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                    onClick={handleStop}
                    >
                        <Pause fill={activeExecution === 'stop' ? 'white' : 'black'} />
                        Stop
                    </button>
                </div>
                
                {/* Speed Limit for Algo */}
                <div className='flex gap-2 items-center'>
                    <p className='font-semibold text-sm'>Speed</p>
                    {['1x', '2x', '5x'].map((spd) => (
                        <button key={spd} type="button" className={`w-auto h-10 p-2 border border-gray-300 rounded-lg ${activeSpeed === spd ? 'bg-[#0066CC] text-white' : 'hover:bg-gray-200'}`}
                        onClick={() => handleSpeedChange(spd)}>
                            {spd}
                        </button>
                    ))}
                </div>

                {/* Reset */}
                {onReset && (
                    <button type="button" className='h-10 px-3 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200 gap-1'
                    onClick={onReset}>
                        <RotateCcw size={16} />
                        <span className='text-sm font-medium'>Reset</span>
                    </button>
                )}
                
            </div>

            {/* Button for show algo step by step line */}
            <div className='flex flex-row gap-2'>
                <button type="button" className='w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'
                onClick={onSkipToStart}>
                    <ChevronsLeft />
                    Skip Back
                </button>
                <button type="button" className='w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'
                onClick={onPrevStep}>
                    <ChevronFirst />
                    Prev Step
                </button>
                <button type="button" className='w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'
                onClick={onNextStep}>
                    Next Step
                    <ChevronLast />
                </button>
                <button type="button" className='w-35.5 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200'
                onClick={onSkipToEnd}>
                    Skip Forward
                    <ChevronsRight />
                </button>
            </div>
        </div>
    </div>
    )
}

export default ControlPanel