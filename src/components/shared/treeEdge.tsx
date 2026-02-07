import React from 'react';
import { BaseEdge, getStraightPath, type EdgeProps } from '@xyflow/react';

// Custom Tree Edge that extends to touch circle node borders
// Adjusts the path to account for node radius so edge touches the circle
export default function TreeEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style,
    markerEnd,
}: EdgeProps) {
    // Node radius (w-14 = 56px, so radius = 28px)
    const nodeRadius = 28;

    // Calculate the angle from source to target
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;
    const angle = Math.atan2(deltaY, deltaX);

    // Adjust source point to be at circle edge (move towards target)
    const adjustedSourceX = sourceX + Math.cos(angle) * (nodeRadius * 0.3);
    const adjustedSourceY = sourceY + Math.sin(angle) * (nodeRadius * 0.3);

    // Adjust target point to be at circle edge (move towards source)
    const adjustedTargetX = targetX - Math.cos(angle) * (nodeRadius * 0.3);
    const adjustedTargetY = targetY - Math.sin(angle) * (nodeRadius * 0.3);

    const [edgePath] = getStraightPath({
        sourceX: adjustedSourceX,
        sourceY: adjustedSourceY,
        targetX: adjustedTargetX,
        targetY: adjustedTargetY,
    });

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            style={{
                ...style,
                strokeWidth: 2,
                stroke: '#5D5D5D',
            }}
            markerEnd={markerEnd}
        />
    );
}
