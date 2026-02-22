import React from 'react'
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';

type CustomNodeData = {
    label: string;
    variant?: 'square' | 'circle';
    isHighlighted?: boolean;
    isGlowing?: boolean;
    isDanger?: boolean;
};

export default function CustomNode({ data }: NodeProps<Node<CustomNodeData>>) {
    const isCircle = data.variant === 'circle';
    const bgColor = data.isDanger ? 'bg-[#BF1A1A]' : 'bg-[#D9E363]';
    const textColor = data.isDanger ? 'text-white' : 'text-[#222121]';
    const borderColor = data.isDanger ? 'border-[#BF1A1A]' : (data.isHighlighted ? 'border-[#D9E363]' : 'border-[#5D5D5D]');
    const borderWidth = data.isHighlighted || data.isDanger ? 'border-4' : 'border-2';

    return (
        <div
            className={`relative shrink-0 flex ${textColor} text-2xl font-semibold justify-center items-center ${borderWidth} ${borderColor} ${bgColor} w-14 h-14 cursor-grab transition-colors duration-200 ${isCircle ? 'rounded-full' : 'rounded-lg'}`}
            style={{
                boxShadow: data.isGlowing
                    ? '0 0 20px rgba(40, 40, 40, 0.8), 0 0 40px rgba(55, 55, 55, 0.5)'
                    : undefined,
            }}
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