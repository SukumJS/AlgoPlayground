import React from 'react'
import type { Node, NodeProps } from '@xyflow/react';

export default function CustomNode({ data }: NodeProps<Node<{ label: string }>>) {
    return (
        <div className="shrink-0 flex text-[#222121] text-2xl font-semibold justify-center items-center border-2 border-[#5D5D5D] bg-[#D9E363] w-14 h-14 rounded-lg cursor-grab">
            {data.label}
        </div>
    );
}