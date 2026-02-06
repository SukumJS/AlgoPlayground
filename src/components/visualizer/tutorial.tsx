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
}

export default function Tutorial({ onComplete, currentStep, setCurrentStep, onNodeDropped }: TutorialProps) {
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
            {/* Dark overlay */}
            <div className="fixed inset-0 z-40 pointer-events-none">
                <div className="absolute inset-0 bg-black/50" />
            </div>

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
                    {/* Arrow pointing RIGHT - shorter to point at node 3 */}
                    <div
                        className="absolute w-0 h-0"
                        style={{
                            right: '-10px',
                            top: '50%',
                            marginTop: '-6px',
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent',
                            borderLeft: '10px solid white',
                        }}
                    />
                    {/* Short dashed line pointing to node 3 */}
                    <svg
                        className="absolute pointer-events-none"
                        style={{
                            left: '100%',
                            top: '50%',
                            marginTop: '-5px',
                            width: '100px',
                            height: '10px',
                        }}
                    >
                        <defs>
                            <marker id="arrowhead-right" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <polygon points="0 0, 6 3, 0 6" fill="#333" />
                            </marker>
                        </defs>
                        <line x1="10" y1="5" x2="65" y2="5" stroke="#333" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrowhead-right)" />
                    </svg>
                </div>
            )}

            {/* Glow drop zone (Step 1) - Visual indicator only, pointer-events pass through to RF pane */}
            {currentStep === 0 && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: '500px',
                        top: '525px',
                        width: `${GLOW_ZONE.radius * 2}px`,
                        height: `${GLOW_ZONE.radius * 2}px`,
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

            {/* Step 2 & 3 tooltips */}
            {(currentStep === 1 || currentStep === 2) && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl px-4 py-3 max-w-xs border border-gray-200"
                    style={{ top: '120px', left: '50%', transform: 'translateX(-50%)' }}
                >
                    <p className="text-sm text-gray-800 font-medium">
                        {currentStepData.instruction}
                    </p>
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