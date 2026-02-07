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
        instruction: 'Link Created!',
        action: 'click',
        targetSelector: 'body', // Click anywhere
        completed: false,
    },
    {
        id: 5,
        instruction: 'Press and hold the node.',
        action: 'tap',
        targetSelector: '.react-flow__node',
        completed: false,
    },
    {
        id: 6,
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
    node90ScreenPos?: { x: number; y: number } | null;
    sidebarNode3Pos?: { x: number; y: number } | null;
    isTrashActive?: boolean;
    trashBinPos?: { x: number; y: number } | null;
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
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default function TutorialTree({ onComplete, currentStep, setCurrentStep, onNodeDropped, droppedNodeScreenPos, node30ScreenPos, node90ScreenPos, sidebarNode3Pos, isTrashActive, trashBinPos }: TutorialProps) {
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
            {/* SVG Overlay for Spotlight Effect */}
            <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-50"
                style={{ position: 'fixed' }}
            >
                <defs>
                    <mask id="spotlight-mask">
                        {/* Whole screen white (visible) */}
                        <rect width="100%" height="100%" fill="white" />

                        {/* Spotlight holes (black = transparent/cutout) */}
                        {/* Step 1: Spotlight on Sidebar Node 3 */}
                        {currentStep === 0 && sidebarNode3Pos && (
                            <circle
                                cx={sidebarNode3Pos.x}
                                cy={sidebarNode3Pos.y}
                                r="33"
                                fill="black"
                            />
                        )}

                        {/* Step 2: Spotlight on dropped node 3 */}
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

                        {/* Step 5 & 6: Spotlight on node 90 (Press & Drag steps) */}
                        {(currentStep === 4 || currentStep === 5) && node90ScreenPos && (
                            <circle
                                cx={node90ScreenPos.x}
                                cy={node90ScreenPos.y}
                                r="57"
                                fill="black"
                            />
                        )}
                        {/* Fallback for Step 5/6 if node90 position not ready */}
                        {(currentStep === 4 || currentStep === 5) && !node90ScreenPos && (
                            <circle
                                cx={1086}
                                cy={630}
                                r="57"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>

                {/* Step 0: Full dark overlay (no spotlight) */}
                {currentStep === 0 && !sidebarNode3Pos && (
                    <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" />
                )}
                {/* Step 0: Dark overlay with spotlight mask applied if sidebar pos found */}
                {currentStep === 0 && sidebarNode3Pos && (
                    <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)" mask="url(#spotlight-mask)" />
                )}

                {/* Steps 1, 2, 5 & 6: Dark overlay with spotlight mask applied */}
                {(currentStep === 1 || currentStep === 2 || currentStep === 4 || currentStep === 5) && (
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.5)"
                        mask="url(#spotlight-mask)"
                    />
                )}

                {/* Step 4 (Link Created): Full dark overlay */}
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
                        top: sidebarNode3Pos ? `${sidebarNode3Pos.y - 44}px` : '225px',
                        right: sidebarNode3Pos ? `calc(100vw - ${sidebarNode3Pos.x}px + 110px)` : '420px',
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

            {/* Glow drop zone (Step 1) - Visual indicator only, pointer-events pass through to RF pane */}
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

            {/* Trash bin icon (Step 6 Only) */}
            {currentStep === 5 && (
                <>
                    <div
                        className="fixed z-50 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-200"
                        style={{
                            // Position relative to trash bin, or fallback to fixed if not ready
                            left: trashBinPos ? `${trashBinPos.x - 350}px` : '55%',
                            top: trashBinPos ? `${trashBinPos.y - 30}px` : '85%',
                            transform: 'translateY(-50%)', // Center vertically relative to target
                        }}
                    >
                        <p className="text-base text-gray-800 font-medium">
                            Drag it to the trash bin icon.
                        </p>
                        {/* Arrow pointing RIGHT to node 90 */}
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
                        onClick={handleStepComplete}
                        onDrop={(e) => { e.preventDefault(); handleStepComplete(); }}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <Trash2 color="white" size={40} />
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
                    {/* Arrow pointing LEFT to node 3 */}
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
                    {/* Arrow pointing LEFT to node 30 */}
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
                        className="fixed inset-0 z-[60] cursor-pointer"
                        onClick={() => setCurrentStep(4)}
                    />
                    <div
                        className="fixed z-50 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-200"
                        style={{
                            left: `${(droppedNodeScreenPos.x + node30ScreenPos.x) / 2 + 50}px`,
                            top: `${(droppedNodeScreenPos.y + node30ScreenPos.y) / 2 - 15}px`,
                            pointerEvents: 'none',
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

            {/* Step 5: Press Node 90 */}
            {currentStep === 4 && (
                <div
                    className="fixed z-50 bg-white rounded-lg shadow-xl px-4 py-2 border border-gray-200"
                    style={{
                        // Position relative to node 90 (left side)
                        // Arrow should mimic image: [Tooltip]--> (Node 90)
                        right: `calc(100vw - ${(node90ScreenPos ? node90ScreenPos.x : 1086)}px + 120px)`, // Position on Left side of node
                        top: `${(node90ScreenPos ? node90ScreenPos.y : 630) - 20}px`,
                        borderRadius: '10px',
                    }}
                >
                    <p className="text-base text-gray-800 font-medium whitespace-nowrap">
                        Press and hold the node.
                    </p>
                    {/* Arrow pointing RIGHT to node 90 */}
                    <DashedArrow
                        width={50}
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