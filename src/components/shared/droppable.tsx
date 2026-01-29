import React from 'react'
import {useDroppable} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type DroppableProps = {
    id: string;
    children: React.ReactNode; 
}

const Droppable = ({id, children}: DroppableProps) => {
    const {isOver, setNodeRef} = useDroppable({
        id: 'droppable',
    });
    const style = {
        color: isOver ? 'green' : undefined,
    };
    return (
        <div 
        ref={setNodeRef} 
        style={style}
        >
            {children}
        </div>
    )
}

export default Droppable