import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";

// Custom Edge that extends to touch circle node borders
// Supports labels for graph weights
export default function TreeEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  style,
  markerEnd,
}: EdgeProps) {
  // Node radius (w-14 = 56px, so radius = 28px)
  const nodeRadius = 28;

  // Calculate the angle from source to target
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const angle = Math.atan2(deltaY, deltaX);

  // Adjust source point to be at circle edge
  const adjustedSourceX = sourceX + Math.cos(angle) * nodeRadius;
  const adjustedSourceY = sourceY + Math.sin(angle) * nodeRadius;

  // Adjust target point to be at circle edge
  const adjustedTargetX = targetX - Math.cos(angle) * nodeRadius;
  const adjustedTargetY = targetY - Math.sin(angle) * nodeRadius;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "#5D5D5D",
        }}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
              fontSize: "12px",
              fontWeight: 500,
              color: "#5D5D5D",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
