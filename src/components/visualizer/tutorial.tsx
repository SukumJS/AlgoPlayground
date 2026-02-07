'use client';

import React, { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { TutorialStep } from '@/src/app/types/tutorial';

// Tutorial steps for Tree (BST)
const TREE_TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 1,
        instruction: 'Drag a node from the panel and drop it where the playground glows.',
        action: 'drag',
        targetSelector: '.data-panel-node',
        completed: false,
    },
    {
        id: 2,
        instruction: 'Tap a node to start.',
        action: 'tap',
        targetSelector: '.react-flow__node',
        completed: false,
    },
    {
        id: 3,
        instruction: 'Now, tap another node to create a link.',
        action: 'connect',
        targetSelector: '.react-flow__node',
        completed: false,
    },
    {
        id: 4,
        instruction: 'Drag it to the trash bin icon.',
        action: 'delete',
        targetSelector: '.trash-bin',
        completed: false,
    },
];

// Glow zone canvas position - Under node 30
// Screen position: left:500px, top:525px (center: 540, 565)
// Calculated canvas coords: x=78.5, y=283.25 (scale=2, tx=383, ty=-1.5)
export const GLOW_ZONE = {
    x: 80,
    y: 285,
    radius: 40,
};

interface TutorialProps {
    onComplete: () => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    onNodeDropped?: () => void;
    // Dynamic screen positions for spotlight
    droppedNodeScreenPos?: { x: number; y: number } | null;
    node30ScreenPos?: { x: number; y: number } | null;
}

// Custom Dashed Arrow Component matching Lucide style
const DashedArrow = ({ className, style, width = 50, color = "#333" }: { className?: string, style?: React.CSSProperties, width?: number, color?: string }) => (
    <svg
        width={width}
        height="24"
        viewBox={`0 0 ${width} 24`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={style}
    >
        {/* Dashed Shaft */}
        <path
            d={`M${width - 2} 12H5`}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 4"
        />
        {/* Solid Arrowhead (Left pointing) */}
        <path
            d="M12 19L5 12L12 5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default function Tutorial({ onComplete, currentStep, setCurrentStep, onNodeDropped, droppedNodeScreenPos, node30ScreenPos }: TutorialProps) {
    const [steps, setSteps] = useState<TutorialStep[]>(TREE_TUTORIAL_STEPS);

    const handleStepComplete = useCallback(() => {
        if (currentStep < steps.length) {
            setSteps(prev => prev.map((step, idx) =>
                idx === currentStep ? { ...step, completed: true } : step
            ));

            if (currentStep === steps.length - 1) {
                onComplete();
            } else {
                setCurrentStep(currentStep + 1);
            }
        }
    }, [currentStep, steps.length, onComplete, setCurrentStep]);

    const handleDropOnGlow = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (currentStep === 0) {
            handleStepComplete();
            onNodeDropped?.();
        }
    }, [currentStep, handleStepComplete, onNodeDropped]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const currentStepData = steps[currentStep];

    if (!currentStepData) {
        return null;
    }

    return (
        <>
            {/* Dark overlay with spotlight cutouts - using SVG for multiple holes */}
            <svg
                className="fixed inset-0 z-40 pointer-events-none"
                style={{ width: '100vw', height: '100vh' }}
            >
                <defs>
                    <mask id="spotlight-mask">
                        {/* White = visible (dark overlay shows), Black = hidden (spotlight hole) */}
                        <rect width="100%" height="100%" fill="white" />

                        {/* Step 2: Spotlight on node 3 (dropped node) */}
                        {currentStep === 1 && droppedNodeScreenPos && (
                            <circle
                                cx={droppedNodeScreenPos.x}
                                cy={droppedNodeScreenPos.y}
                                r="57"
                                fill="black"
                            />
                        )}

                        {/* Step 3: Dual spotlight - both node 3 AND node 30 */}
                        {currentStep === 2 && droppedNodeScreenPos && (
                            <circle
                                cx={droppedNodeScreenPos.x}
                                cy={droppedNodeScreenPos.y}
                                r="57"
                                fill="black"
                            />
                        )}
                        {currentStep === 2 && node30ScreenPos && (
                            <circle
                                cx={node30ScreenPos.x}
                                cy={node30ScreenPos.y}
                                r="57"
                                fill="black"
                            />
                        )}

                        {/* Step 5: Spotlight on node 90 (trash step) - with fallback */}
                        {currentStep === 4 && (
                            <circle
                                cx={node30ScreenPos ? node30ScreenPos.x + 546 : 1086} // node90 is relative to 30 roughly? or just static fallback: 1086
                                cy={node30ScreenPos ? node30ScreenPos.y + 65 : 630}
                                r="57"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>

                {/* Step 0: Full dark overlay (no spotlight) */}
                {currentStep === 0 && (
                    <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" />
                )}

                {/* Steps 1-2 & 4: Dark overlay with spotlight mask applied */}
                {(currentStep === 1 || currentStep === 2 || currentStep === 4) && (
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.5)"
                        mask="url(#spotlight-mask)"
                    />
                )}

                {/* Step 3 (Link Created): Full dark overlay (or maybe spotlight on link? keeping simple for now) */}
                {currentStep === 3 && (
                    <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" />
                )}
            </svg>

            {/* Step 1: Tooltip with exact Figma size 326x88px */}
            {currentStep === 0 && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl px-5 py-4 border border-gray-200 flex items-center"
                    style={{
                        width: '326px',
                        height: '88px',
                        top: '225px',
                        right: '420px',
                    }}
                >
                    <p className="text-base text-gray-800">
                        <span className="font-bold">Drag a node</span> from the panel and drop it where the playground glows.
                    </p>
                    {/* Arrow pointing RIGHT - rotated 180deg */}
                    <DashedArrow
                        width={60}
                        className="absolute pointer-events-none"
                        style={{
                            left: '100%',
                            top: '50%',
                            marginTop: '-12px',
                            marginLeft: '10px',
                            transform: 'rotate(180deg)', // Point Right
                        }}
                    />
                </div>
            )}

            {/* Glow drop zone (Step 1) - Visual indicator only */}
            {currentStep === 0 && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: '500px',
                        top: '525px',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        border: '3px solid rgba(255,255,255,0.9)',
                        background: 'transparent',
                        boxShadow: '0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.3)',
                        animation: 'glow-ring 2s ease-in-out infinite',
                    }}
                />
            )}

            {/* Trash bin icon (Step 4) */}
            {currentStep === 3 && (
                <>
                    <div
                        className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 max-w-xs border border-gray-200"
                        style={{ bottom: '180px', left: '50%', transform: 'translateX(-50%)' }}
                    >
                        <p className="text-sm text-gray-800 font-medium">
                            Drag it to the trash bin icon.
                        </p>
                    </div>
                    <div
                        className="trash-bin fixed z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#FF4D4D] cursor-pointer hover:bg-[#FF3333] transition-colors shadow-lg"
                        style={{ bottom: '100px', left: '50%', transform: 'translateX(-50%)' }}
                        onClick={handleStepComplete}
                        onDrop={(e) => { e.preventDefault(); handleStepComplete(); }}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <Trash2 color="white" size={24} />
                    </div>
                </>
            )}

            {/* Step 2: Tooltip pointing to node 3 */}
            {currentStep === 1 && droppedNodeScreenPos && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 max-w-xs border border-gray-200"
                    style={{
                        left: `${droppedNodeScreenPos.x + 120}px`,
                        top: `${droppedNodeScreenPos.y - 20}px`,
                        borderRadius: '10px',
                    }}
                >
                    <p className="text-base text-gray-800 font-medium whitespace-nowrap">
                        Tap a node to start.
                    </p>
                    {/* Arrow pointing LEFT */}
                    <DashedArrow
                        width={50}
                        className="absolute pointer-events-none"
                        style={{
                            right: '100%',
                            top: '50%',
                            marginTop: '-12px',
                            marginRight: '10px',
                        }}
                    />
                </div>
            )}

            {/* Step 3: Tooltip pointing to node 30 */}
            {currentStep === 2 && node30ScreenPos && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 max-w-xs border border-gray-200"
                    style={{
                        left: `${node30ScreenPos.x + 120}px`,
                        top: `${node30ScreenPos.y - 20}px`,
                        borderRadius: '10px',
                    }}
                >
                    <p className="text-base text-gray-800 font-medium">
                        Now, tap another node to create a link.
                    </p>
                    {/* Arrow pointing LEFT */}
                    <DashedArrow
                        width={50}
                        className="absolute pointer-events-none"
                        style={{
                            right: '100%',
                            top: '50%',
                            marginTop: '-12px',
                            marginRight: '10px',
                        }}
                    />
                </div>
            )}

            {/* Step 4: Link Created! */}
            {currentStep === 3 && droppedNodeScreenPos && node30ScreenPos && (
                <>
                    <div
                        className="fixed inset-0 z-[45] cursor-pointer"
                        onClick={() => setCurrentStep(4)}
                    />
                    <div
                        className="fixed z-50 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-200"
                        style={{
                            left: `${(droppedNodeScreenPos.x + node30ScreenPos.x) / 2 + 40}px`,
                            top: `${(droppedNodeScreenPos.y + node30ScreenPos.y) / 2 - 15}px`,
                        }}
                    >
                        <p className="text-base text-gray-800 font-medium whitespace-nowrap">
                            Link Created!
                        </p>
                        {/* Arrow pointing LEFT */}
                        <DashedArrow
                            width={30}
                            className="absolute pointer-events-none"
                            style={{
                                right: '100%',
                                top: '50%',
                                marginTop: '-12px',
                                marginRight: '10px',
                            }}
                        />
                    </div>
                </>
            )}

            {/* Step 5: Drag to trash bin */}
            {currentStep === 4 && (
                <div
                    className="fixed z-50 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-200"
                    style={{
                        // Fallback position for node 90
                        left: `${(node30ScreenPos ? node30ScreenPos.x + 546 : 1086) - 260}px`,
                        top: `${(node30ScreenPos ? node30ScreenPos.y + 65 : 630) - 15}px`,
                    }}
                >
                    <p className="text-base text-gray-800 font-medium">
                        Drag it to the trash bin icon.
                    </p>
                    {/* Arrow pointing RIGHT to node 90 */}
                    <DashedArrow
                        width={40}
                        className="absolute pointer-events-none"
                        style={{
                            left: '100%',
                            top: '50%',
                            marginTop: '-12px',
                            marginLeft: '10px',
                            transform: 'rotate(180deg)',
                        }}
                    />
                </div>
            )}

            {/* CSS animations */}
            <style jsx>{`
                @keyframes glow-ring {
                    0%, 100% { 
                        opacity: 0.7;
                        box-shadow: 0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.3);
                    }
                    50% { 
                        opacity: 1;
                        box-shadow: 0 0 30px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.5);
                    }
                }
            `}</style>
        </>
    );
}

export { TREE_TUTORIAL_STEPS };