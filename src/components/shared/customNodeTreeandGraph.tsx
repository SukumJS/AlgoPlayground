import React from 'react'
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';

type CustomNodeData = {
    label: string;
    variant?: 'square' | 'circle';
    isHighlighted?: boolean;
    isGlowing?: boolean;
    isDanger?: boolean;
    highlightColor?: string;
    balanceFactor?: number;
};

export default function CustomNode({ data }: NodeProps<Node<CustomNodeData>>) {
    const isCircle = data.variant === 'circle';

    // Determine colors based on highlight status
    let bgColorClass = data.isDanger ? 'bg-[#BF1A1A]' : 'bg-[#D9E363]';
    let textColorClass = data.isDanger ? 'text-white' : 'text-[#222121]';

    let inlineStyle: React.CSSProperties = {
        boxShadow: data.isGlowing
            ? '0 0 20px rgba(40, 40, 40, 0.8), 0 0 40px rgba(55, 55, 55, 0.5)'
            : undefined,
    };

    // Override with highlight colors if highlighted
    if (data.isHighlighted && data.highlightColor) {
        if (data.highlightColor.startsWith('#')) {
            bgColorClass = '';
            textColorClass = '';

            inlineStyle.backgroundColor = data.highlightColor;

            if (data.highlightColor.toUpperCase() === '#F7AD45') {
                inlineStyle.color = '#222121';
            } else {
                inlineStyle.color = 'white';
            }
        } else {
            switch (data.highlightColor) {
                case 'blue':
                    bgColorClass = 'bg-[#62A2F7]';
                    textColorClass = 'text-white';
                    break;
                case 'red':
                    bgColorClass = 'bg-[#EF4444]';
                    textColorClass = 'text-white';
                    break;
                case 'yellow':
                    bgColorClass = 'bg-[#F7AD45]';
                    textColorClass = 'text-[#222121]';
                    break;
                case 'green':
                    bgColorClass = 'bg-[#4CAF7D]';
                    textColorClass = 'text-white';
                    break;
            }
        }
    }

    const borderWidthClass = 'border-2';

    return (
        <div
            className={`relative shrink-0 flex ${textColorClass} text-2xl font-semibold justify-center items-center ${borderWidthClass} border-[#5D5D5D] group-data-[tutorial=true]:border-[#552222] ${bgColorClass} w-14 h-14 cursor-grab transition-colors duration-200 ${isCircle ? 'rounded-full' : 'rounded-lg'}`}
            style={inlineStyle}
        >
            {/* Target handles - positioned at circle corners (45° angles) */}
            {/* For 56px circle, 45° point is at ~71% from center = ~20px offset from edges */}
            <Handle
                id="target-top-left"
                type="target"
                position={Position.Top}
                className="bg-transparent! border-0! w-1! h-1!"
                style={{
                    left: '15%',
                    top: '15%',
                }}
            />
            <Handle
                id="target-top-right"
                type="target"
                position={Position.Top}
                className="bg-transparent! border-0! w-1! h-1!"
                style={{
                    left: '85%',
                    top: '15%',
                }}
            />

            {data.label}

            {/* Balance factor badge — shown only during AVL balance-check animations */}
            {data.balanceFactor !== undefined && (
                <div className={`absolute -top-3 -right-3 w-6 h-6 rounded-full border text-xs flex items-center justify-center font-bold font-mono z-50 shadow-sm pointer-events-none ${Math.abs(data.balanceFactor as number) > 1
                    ? 'bg-red-100 border-red-400 text-red-800'
                    : 'bg-blue-100 border-blue-400 text-blue-800'
                    }`}>
                    {(data.balanceFactor as number) > 0 ? `+${data.balanceFactor}` : data.balanceFactor}
                </div>
            )}

            {/* Source handles - positioned at circle corners (45° angles) */}
            <Handle
                id="source-bottom-left"
                type="source"
                position={Position.Bottom}
                className="bg-transparent! border-0! w-1! h-1!"
                style={{
                    left: '15%',
                    top: '85%',
                }}
            />
            <Handle
                id="source-bottom-right"
                type="source"
                position={Position.Bottom}
                className="bg-transparent! border-0! w-1! h-1!"
                style={{
                    left: '85%',
                    top: '85%',
                }}
            />
        </div>
    );
}

