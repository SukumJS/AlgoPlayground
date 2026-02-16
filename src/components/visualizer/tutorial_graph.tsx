'use client';

import React from 'react';
import { Trash2, Check } from 'lucide-react';

// Graph Tutorial Steps configuration
const GRAPH_TUTORIAL_STEPS = [
    { id: 0, instruction: 'Tap a node to start.', action: 'tap' },
    { id: 1, instruction: 'Now, tap another node to create a link.', action: 'tap' },
    { id: 2, instruction: "Type '2' to set the weight.", action: 'input' },
    { id: 3, instruction: 'Value Set!', action: 'confirm' },
    { id: 4, instruction: 'Tap this weight!', action: 'tap' },
    { id: 5, instruction: "Type '5' to edit the weight.", action: 'input' },
    { id: 6, instruction: 'Value Set!', action: 'confirm' },
    { id: 7, instruction: 'Tap to hold node 70.', action: 'tap' },
    { id: 8, instruction: 'Drag it to the trash bin icon.', action: 'drag' },
    { id: 9, instruction: 'Tutorial Completed!', action: 'complete' },
];

// Custom Dashed Arrow Component
const DashedArrow = ({
    className,
    style,
    width = 50,
    color = "#333",
    direction = "left" // "left" | "right" | "up" | "down"
}: {
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    color?: string;
    direction?: "left" | "right" | "up" | "down";
}) => {
    const rotate = {
        left: 0,
        right: 180,
        up: 90,
        down: -90,
    }[direction];

    return (
        <svg
            width={width}
            height="24"
            viewBox={`0 0 ${width} 24`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ ...style, transform: `rotate(${rotate}deg)` }}
        >
            <path
                d={`M${width - 2} 12H5`}
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="4 4"
            />
            <path
                d="M12 19L5 12L12 5"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

interface TutorialGraphProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    onComplete: () => void;
    // Screen positions
    node69ScreenPos?: { x: number; y: number } | null;
    node70ScreenPos?: { x: number; y: number } | null;
    edge64to39WeightPos?: { x: number; y: number } | null;
    trashBinPos?: { x: number; y: number } | null;
    isTrashActive?: boolean;
    // Weight input
    showWeightInput?: boolean;
    weightInputValue?: string;
    onWeightInputChange?: (value: string) => void;
    onWeightConfirm?: () => void;
}

export default function TutorialGraph({
    currentStep,
    setCurrentStep,
    onComplete,
    node69ScreenPos,
    node70ScreenPos,
    edge64to39WeightPos,
    trashBinPos,
    isTrashActive = false,
    showWeightInput = false,
    weightInputValue = '',
    onWeightInputChange,
    onWeightConfirm,
}: TutorialGraphProps) {
    const stepData = GRAPH_TUTORIAL_STEPS[currentStep];
    if (!stepData) return null;

    return (
        <>
            {/* SVG Overlay for Spotlight Effect */}
            <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-50"
                style={{ position: 'fixed' }}
            >
                <defs>
                    <mask id="graph-spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />

                        {/* Step 0: Spotlight on node 69 */}
                        {currentStep === 0 && node69ScreenPos && (
                            <circle cx={node69ScreenPos.x} cy={node69ScreenPos.y} r="45" fill="black" />
                        )}

                        {/* Step 1: Dual spotlight - node 69 and node 70 */}
                        {currentStep === 1 && node69ScreenPos && (
                            <circle cx={node69ScreenPos.x} cy={node69ScreenPos.y} r="45" fill="black" />
                        )}
                        {currentStep === 1 && node70ScreenPos && (
                            <circle cx={node70ScreenPos.x} cy={node70ScreenPos.y} r="45" fill="black" />
                        )}

                        {/* Step 4: Spotlight on edge 64→39 weight */}
                        {currentStep === 4 && edge64to39WeightPos && (
                            <circle cx={edge64to39WeightPos.x} cy={edge64to39WeightPos.y} r="30" fill="black" />
                        )}

                        {/* Step 7, 8: Spotlight on node 70 */}
                        {(currentStep === 7 || currentStep === 8) && node70ScreenPos && (
                            <circle cx={node70ScreenPos.x} cy={node70ScreenPos.y} r="45" fill="black" />
                        )}
                    </mask>
                </defs>

                {/* Dark overlay with spotlight */}
                {(currentStep === 0 || currentStep === 1 || currentStep === 4 || currentStep === 7 || currentStep === 8) && (
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.5)"
                        mask="url(#graph-spotlight-mask)"
                    />
                )}

                {/* Steps 2, 3, 5, 6: Full dark overlay (no spotlight, focus on input) */}
                {(currentStep === 2 || currentStep === 3 || currentStep === 5 || currentStep === 6) && (
                    <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" />
                )}
            </svg>

            {/* Step 0: Tooltip pointing to node 69 */}
            {currentStep === 0 && node69ScreenPos && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 border border-gray-200"
                    style={{
                        left: `${node69ScreenPos.x + 80}px`,
                        top: `${node69ScreenPos.y - 20}px`,
                    }}
                >
                    <p className="text-base text-gray-800 font-medium whitespace-nowrap">
                        Tap a node to start.
                    </p>
                    <DashedArrow
                        width={50}
                        className="absolute pointer-events-none"
                        style={{ right: '100%', top: '50%', marginTop: '-12px', marginRight: '10px' }}
                        direction="left"
                    />
                </div>
            )}

            {/* Step 1: Tooltip pointing to node 70 */}
            {currentStep === 1 && node70ScreenPos && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 border border-gray-200"
                    style={{
                        left: `${node70ScreenPos.x + 80}px`,
                        top: `${node70ScreenPos.y - 20}px`,
                    }}
                >
                    <p className="text-base text-gray-800 font-medium">
                        Now, tap another node to create a link.
                    </p>
                    <DashedArrow
                        width={50}
                        className="absolute pointer-events-none"
                        style={{ right: '100%', top: '50%', marginTop: '-12px', marginRight: '10px' }}
                        direction="left"
                    />
                </div>
            )}

            {/* Step 2 & 5: Weight Input Modal */}
            {showWeightInput && (currentStep === 2 || currentStep === 5) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 min-w-[280px]">
                        <p className="text-lg text-gray-800 font-medium mb-4 text-center">
                            {currentStep === 2 ? "Type '2' to set the weight." : "Type '5' to edit the weight."}
                        </p>
                        <input
                            type="number"
                            value={weightInputValue}
                            onChange={(e) => onWeightInputChange?.(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') onWeightConfirm?.();
                            }}
                            className="w-full text-center text-3xl font-bold p-4 border-2 border-gray-300 rounded-xl focus:border-[#D9E363] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                            autoFocus
                        />
                        <button
                            onClick={onWeightConfirm}
                            className="w-full mt-4 bg-[#222121] text-white py-3 rounded-xl font-semibold hover:bg-[#333] transition-colors"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3 & 6: Value Set! Confirmation */}
            {(currentStep === 3 || currentStep === 6) && (
                <>
                    <div
                        className="fixed inset-0 z-[60] cursor-pointer"
                        onClick={() => setCurrentStep(currentStep + 1)}
                    />
                    <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl px-6 py-4 border border-gray-200">
                        <p className="text-lg text-gray-800 font-bold text-center">
                            Value Set!
                        </p>
                    </div>
                </>
            )}

            {/* Step 4: Tooltip pointing to edge weight */}
            {currentStep === 4 && edge64to39WeightPos && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 border border-gray-200"
                    style={{
                        left: `${edge64to39WeightPos.x + 50}px`,
                        top: `${edge64to39WeightPos.y - 20}px`,
                    }}
                >
                    <p className="text-base text-gray-800 font-medium whitespace-nowrap">
                        Tap this weight!
                    </p>
                    <DashedArrow
                        width={30}
                        className="absolute pointer-events-none"
                        style={{ right: '100%', top: '50%', marginTop: '-12px', marginRight: '10px' }}
                        direction="left"
                    />
                </div>
            )}

            {/* Step 7: Tooltip for hold node 70 */}
            {currentStep === 7 && node70ScreenPos && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 border border-gray-200"
                    style={{
                        left: `${node70ScreenPos.x + 80}px`,
                        top: `${node70ScreenPos.y - 20}px`,
                    }}
                >
                    <p className="text-base text-gray-800 font-medium whitespace-nowrap">
                        Tap to hold node 70.
                    </p>
                    <DashedArrow
                        width={50}
                        className="absolute pointer-events-none"
                        style={{ right: '100%', top: '50%', marginTop: '-12px', marginRight: '10px' }}
                        direction="left"
                    />
                </div>
            )}

            {/* Step 8: Trash bin and tooltip */}
            {currentStep === 8 && (
                <>
                    <div
                        className="fixed z-50 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-200"
                        style={{
                            left: trashBinPos ? `${trashBinPos.x - 350}px` : '55%',
                            top: trashBinPos ? `${trashBinPos.y - 30}px` : '85%',
                            transform: 'translateY(-50%)',
                        }}
                    >
                        <p className="text-base text-gray-800 font-medium">
                            Drag it to the trash bin icon.
                        </p>
                        <DashedArrow
                            width={60}
                            className="absolute pointer-events-none"
                            style={{ left: '100%', top: '50%', marginTop: '-12px', marginLeft: '10px' }}
                            direction="right"
                        />
                    </div>
                    <div
                        className={`trash-bin fixed z-50 flex items-center justify-center w-17 h-17 rounded-full bg-[#FF4D4D] cursor-pointer hover:bg-[#FF3333] transition-all duration-300 shadow-lg border-3 border-[#5D5D5D] ${isTrashActive ? 'scale-110' : ''}`}
                        style={{
                            bottom: '140px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            boxShadow: isTrashActive
                                ? '0 0 30px 10px rgba(255, 77, 77, 0.8), 0 0 10px 5px rgba(255, 255, 255, 0.5)'
                                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Trash2 color="white" size={40} />
                    </div>
                </>
            )}

            {/* Step 9: Completion Modal */}
            {currentStep === 9 && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200 text-center min-w-[320px]">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check color="white" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Tutorial Completed!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            You&apos;re now ready to use Graph Playground.
                        </p>
                        <button
                            onClick={onComplete}
                            className="w-full bg-[#222121] text-white py-3 rounded-xl font-semibold hover:bg-[#333] transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export { GRAPH_TUTORIAL_STEPS };
