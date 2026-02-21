import React from 'react'
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import type { NodeAnimationState } from '@/src/types/algorithm';

// ── Animation color maps (Figma spec) ────────────────────────────
const ANIM_BG: Record<NodeAnimationState, string> = {
    default: '#D9E363',
    visiting: '#62A2F7',
    visited: '#62A2F7',
    'target-found': '#62A2F7',
};

const ANIM_TEXT: Record<NodeAnimationState, string> = {
    default: '#222121',
    visiting: '#FFFFFF',
    visited: '#FFFFFF',
    'target-found': '#FFFFFF',
};

const ANIM_BORDER: Record<NodeAnimationState, string> = {
    default: '#5D5D5D',
    visiting: '#5D5D5D',
    visited: '#5D5D5D',
    'target-found': '#5D5D5D',
};

type CustomNodeData = {
    label: string;
    variant?: 'square' | 'circle';
    isHighlighted?: boolean;
    isGlowing?: boolean;
    isDanger?: boolean;
    animationState?: NodeAnimationState;
};

export default function CustomNode({ data }: NodeProps<Node<CustomNodeData>>) {
    const isCircle = data.variant === 'circle';
    const animState = data.animationState;

    // When animationState is set, use animation colors; otherwise fall back to original logic
    let bgColor: string;
    let textColor: string;
    let borderColor: string;
    const borderWidth = data.isHighlighted || data.isDanger ? 'border-4' : 'border-2';

    if (animState && animState !== 'default') {
        bgColor = '';
        textColor = '';
        borderColor = '';
    } else if (data.isDanger) {
        bgColor = 'bg-[#BF1A1A]';
        textColor = 'text-white';
        borderColor = 'border-[#BF1A1A]';
    } else {
        bgColor = 'bg-[#D9E363]';
        textColor = 'text-[#222121]';
        borderColor = data.isHighlighted ? 'border-[#D9E363]' : 'border-[#5D5D5D]';
    }

    // Build inline style for animation state
    const inlineStyle: React.CSSProperties = {
        boxShadow: data.isGlowing
            ? '0 0 20px rgba(40, 40, 40, 0.8), 0 0 40px rgba(55, 55, 55, 0.5)'
            : undefined,
    };

    if (animState && animState !== 'default') {
        inlineStyle.backgroundColor = ANIM_BG[animState];
        inlineStyle.color = ANIM_TEXT[animState];
        inlineStyle.borderColor = ANIM_BORDER[animState];
    }

    return (
        <div
            className={`relative shrink-0 flex ${textColor} text-2xl font-semibold justify-center items-center ${borderWidth} ${borderColor} ${bgColor} w-14 h-14 cursor-grab transition-colors duration-200 ${isCircle ? 'rounded-full' : 'rounded-lg'}`}
            style={inlineStyle}
        >
            {/* Target handles - positioned at circle corners (45° angles) */}
            {/* For 56px circle, 45° point is at ~71% from center = ~20px offset from edges */}
            <Handle
                id="target-top-left"
                type="target"
                position={Position.Top}
                className="!bg-transparent !border-0 !w-1 !h-1"
                style={{
                    left: '15%',
                    top: '15%',
                }}
            />
            <Handle
                id="target-top-right"
                type="target"
                position={Position.Top}
                className="!bg-transparent !border-0 !w-1 !h-1"
                style={{
                    left: '85%',
                    top: '15%',
                }}
            />

            {data.label}

            {/* Source handles - positioned at circle corners (45° angles) */}
            <Handle
                id="source-bottom-left"
                type="source"
                position={Position.Bottom}
                className="!bg-transparent !border-0 !w-1 !h-1"
                style={{
                    left: '15%',
                    top: '85%',
                }}
            />
            <Handle
                id="source-bottom-right"
                type="source"
                position={Position.Bottom}
                className="!bg-transparent !border-0 !w-1 !h-1"
                style={{
                    left: '85%',
                    top: '85%',
                }}
            />
        </div>
    );
}