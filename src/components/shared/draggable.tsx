import React from 'react'
import {useDraggable} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type DraggableProps = {
    id: string;
    children: React.ReactNode; 
}

const Draggable = ({ id, children }: DraggableProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });
    // Use the CSS utility for a cleaner transform string
    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
    };

    
    return (
        <button
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`
            px-6 py-3 rounded-lg font-medium transition-shadow
            bg-blue-600 text-white shadow-md
            touch-none cursor-grab active:cursor-grabbing
            ${isDragging ? 'opacity-50 shadow-xl' : 'opacity-100'}
        `}
        >
            {children}
        </button>
    );
}

export default Draggable