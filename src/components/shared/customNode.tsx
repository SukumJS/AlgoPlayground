import React from 'react'
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';

type CustomNodeData = {
    label: string;
    variant?: 'square' | 'circle';
};

export default function CustomNode({ data }: NodeProps<Node<CustomNodeData>>) {
    const isCircle = data.variant === 'circle';

    return (
        <div className={`relative shrink-0 flex text-[#222121] text-2xl font-semibold justify-center items-center border-2 border-[#5D5D5D] bg-[#D9E363] w-14 h-14 cursor-grab ${isCircle ? 'rounded-full' : 'rounded-lg'}`}>
            {/* Target handles - for receiving edges */}
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-transparent !border-0 !w-2 !h-2"
            />

            {data.label}

            {/* Source handles - for tree structure, use bottom-left and bottom-right */}
            <Handle
                id="source-bottom-left"
                type="source"
                position={Position.Bottom}
                className="!bg-transparent !border-0 !w-2 !h-2"
                style={{ left: '25%' }}
            />
            <Handle
                id="source-bottom-right"
                type="source"
                position={Position.Bottom}
                className="!bg-transparent !border-0 !w-2 !h-2"
                style={{ left: '75%' }}
            />
            {/* Default bottom center handle for backwards compatibility */}
            <Handle
                id="source-bottom"
                type="source"
                position={Position.Bottom}
                className="!bg-transparent !border-0 !w-2 !h-2"
            />
        </div>
    );
}