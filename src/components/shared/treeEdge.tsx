import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useStore,
  type EdgeProps,
  type InternalNode,
} from "@xyflow/react";

/** Get the center of a node using its absolute position and measured size. */
function getNodeCenter(node: InternalNode) {
  const w = (node.measured?.width ?? 56) / 2;
  const h = (node.measured?.height ?? 56) / 2;
  return {
    x: node.internals.positionAbsolute.x + w,
    y: node.internals.positionAbsolute.y + h,
  };
}

const DEFAULT_STROKE = "#9CA3AF";
const SELECTED_STROKE = "#222121";
const SELECTED_WIDTH = 2;
const HIT_AREA_WIDTH = 20;

/**
 * TreeEdge — straight edge from circle-border to circle-border between nodes.
 *
 * Computes endpoints from actual node centers (via useStore) instead of the
 * raw handle positions. This keeps edges glued to the visible circle border
 * even when nodes are placed close together (handle-to-handle distance can
 * otherwise be shorter than 2×radius, which makes the naive "extend outward"
 * trick invert the line).
 *
 * Supports labels for graph weights. When the edge is selected the visible
 * stroke turns blue and thicker; an invisible wider hit-area path makes
 * clicking near the line easy.
 */
export default function TreeEdge({
  id,
  source,
  target,
  label,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  const { sourceNode, targetNode } = useStore((s) => ({
    sourceNode: s.nodeLookup.get(source),
    targetNode: s.nodeLookup.get(target),
  }));

  if (!sourceNode || !targetNode) return null;

  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);
  const sourceRadius = (sourceNode.measured?.width ?? 56) / 2;
  const targetRadius = (targetNode.measured?.width ?? 56) / 2;

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return null;

  const ux = dx / dist;
  const uy = dy / dist;

  const adjustedSourceX = sourceCenter.x + ux * sourceRadius;
  const adjustedSourceY = sourceCenter.y + uy * sourceRadius;
  const adjustedTargetX = targetCenter.x - ux * targetRadius;
  const adjustedTargetY = targetCenter.y - uy * targetRadius;

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY,
  });

  const visibleStyle = {
    ...style,
    strokeWidth: selected ? SELECTED_WIDTH : 2,
    stroke: selected
      ? SELECTED_STROKE
      : (style?.stroke as string) || DEFAULT_STROKE,
  };

  return (
    <>
      <path
        d={edgePath}
        style={{
          stroke: "transparent",
          strokeWidth: HIT_AREA_WIDTH,
          fill: "none",
          pointerEvents: "stroke",
        }}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        style={visibleStyle}
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
