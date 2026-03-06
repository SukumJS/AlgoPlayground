import React from "react";
import { EdgeLabelRenderer, type EdgeProps } from "@xyflow/react";

/**
 * FloatingEdge - Custom edge that connects to node borders
 *
 * Key features:
 * 1. Calculates intersection at node circle border (not center)
 * 2. Splits edge into 2 paths around the label (no overlap)
 * 3. Dynamic arrow positioning based on angle/distance
 * 4. Preserves user-defined styles
 */
export default function FloatingEdge({
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
  // Gap size for label (transparent area around the number)
  const labelGap = 16;

  // Calculate the angle from source to target
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const angle = Math.atan2(deltaY, deltaX);
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Adjust source point to be at circle edge (start at border)
  const adjustedSourceX = sourceX + Math.cos(angle) * nodeRadius;
  const adjustedSourceY = sourceY + Math.sin(angle) * nodeRadius;

  // Dynamic arrow offset - smaller when nodes are far, just enough for arrowhead
  // Arrowhead size is 25px, so we need minimal padding
  const arrowOffset = nodeRadius + 2; // Just 2px extra for arrowhead tip
  const adjustedTargetX = targetX - Math.cos(angle) * arrowOffset;
  const adjustedTargetY = targetY - Math.sin(angle) * arrowOffset;

  // Calculate midpoint for label
  const midX = (adjustedSourceX + adjustedTargetX) / 2;
  const midY = (adjustedSourceY + adjustedTargetY) / 2;

  // Calculate path segments that stop before and after the label
  const halfLabelGap = labelGap / 2;

  // Points before label
  const beforeLabelX = midX - Math.cos(angle) * halfLabelGap;
  const beforeLabelY = midY - Math.sin(angle) * halfLabelGap;

  // Points after label
  const afterLabelX = midX + Math.cos(angle) * halfLabelGap;
  const afterLabelY = midY + Math.sin(angle) * halfLabelGap;

  // Create two separate paths that don't overlap with label
  const path1 = `M ${adjustedSourceX} ${adjustedSourceY} L ${beforeLabelX} ${beforeLabelY}`;
  const path2 = `M ${afterLabelX} ${afterLabelY} L ${adjustedTargetX} ${adjustedTargetY}`;

  return (
    <>
      {/* First segment: source to before label */}
      <path
        id={`${id}-path1`}
        className="react-flow__edge-path"
        d={path1}
        style={style}
      />
      {/* Second segment: after label to target (with arrow) */}
      <path
        id={`${id}-path2`}
        className="react-flow__edge-path"
        d={path2}
        style={style}
        markerEnd={markerEnd as string}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
              pointerEvents: "all",
              fontSize: "12px",
              fontWeight: 500,
              color: "#222121",
              background: "transparent",
              padding: "4px 8px",
              cursor: "pointer",
              zIndex: 1000,
            }}
            className="nodrag nopan edge-weight-label"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
