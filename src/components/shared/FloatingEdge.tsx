import React from "react";
import {
  EdgeLabelRenderer,
  useStore,
  type EdgeProps,
  type InternalNode,
} from "@xyflow/react";

/**
 * Get the center point of a node using its absolute position and measured dimensions.
 */
function getNodeCenter(node: InternalNode) {
  const w = (node.measured?.width ?? 0) / 2;
  const h = (node.measured?.height ?? 0) / 2;
  return {
    x: node.internals.positionAbsolute.x + w,
    y: node.internals.positionAbsolute.y + h,
  };
}

/**
 * Get the intersection point of the line from sourceCenter to targetCenter
 * with the circular border of the given node.
 */
function getCircleIntersection(node: InternalNode, otherNode: InternalNode) {
  const nodeCenter = getNodeCenter(node);
  const otherCenter = getNodeCenter(otherNode);

  // Circle radius = half of node width (w-14 = 56px → radius = 28px)
  // Subtract 1px so the arrowhead tip visually touches the outer border edge
  const radius = (node.measured?.width ?? 56) / 2 - 1;

  const dx = otherCenter.x - nodeCenter.x;
  const dy = otherCenter.y - nodeCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return nodeCenter;

  return {
    x: nodeCenter.x + (dx / dist) * radius,
    y: nodeCenter.y + (dy / dist) * radius,
  };
}

const DEFAULT_STROKE = "#9CA3AF";
const SELECTED_STROKE = "#222121";
const SELECTED_WIDTH = 2;
const HIT_AREA_WIDTH = 20;

/**
 * FloatingEdge - Custom edge for graph nodes (circular)
 *
 * Uses actual node positions (via useStore) to calculate exact
 * circle-border intersection points. Renders a custom arrowhead
 * polygon flush against the target node border with no gap.
 *
 * Supports `data.directed` flag:
 *   - true (default): directed edge with arrowhead + weight label
 *   - false: undirected edge — plain line, no arrow, no label gap
 *
 * When the edge is selected (via ReactFlow click), the visible stroke
 * switches to a blue accent + thicker width so users can clearly see
 * the selection state. A wider invisible "hit area" path sits beneath
 * the visible stroke so clicking near the edge still registers.
 */
export default function FloatingEdge({
  id,
  source,
  target,
  label,
  data,
  style,
  selected,
}: EdgeProps) {
  const isDirected = data?.directed !== false;

  // Get actual internal nodes (with positionAbsolute and measured dimensions)
  const { sourceNode, targetNode } = useStore((s) => {
    return {
      sourceNode: s.nodeLookup.get(source),
      targetNode: s.nodeLookup.get(target),
    };
  });

  if (!sourceNode || !targetNode) return null;

  // Calculate intersection points on circle borders
  const sourcePoint = getCircleIntersection(sourceNode, targetNode);
  const targetPoint = getCircleIntersection(targetNode, sourceNode);

  const baseStrokeColor = (style?.stroke as string) || DEFAULT_STROKE;
  // Selection only changes width (subtle feedback) — color stays the same so
  // the look is consistent before/after click.
  const strokeColor = selected ? SELECTED_STROKE : baseStrokeColor;
  const visibleStyle: React.CSSProperties = {
    ...style,
    stroke: strokeColor,
    strokeWidth: selected
      ? SELECTED_WIDTH
      : ((style?.strokeWidth as number | undefined) ?? 2),
  };
  const hitAreaStyle: React.CSSProperties = {
    stroke: "transparent",
    strokeWidth: HIT_AREA_WIDTH,
    fill: "none",
    pointerEvents: "stroke",
  };

  // ── Undirected mode: simple line, no arrow ─────────────────────
  if (!isDirected) {
    // If there's a weight label, split path around it (like directed but no arrow)
    if (label) {
      const dx = targetPoint.x - sourcePoint.x;
      const dy = targetPoint.y - sourcePoint.y;
      const angle = Math.atan2(dy, dx);
      const midX = (sourcePoint.x + targetPoint.x) / 2;
      const midY = (sourcePoint.y + targetPoint.y) / 2;
      const labelGap = 16;
      const halfGap = labelGap / 2;
      const beforeLabelX = midX - Math.cos(angle) * halfGap;
      const beforeLabelY = midY - Math.sin(angle) * halfGap;
      const afterLabelX = midX + Math.cos(angle) * halfGap;
      const afterLabelY = midY + Math.sin(angle) * halfGap;

      const path1 = `M ${sourcePoint.x} ${sourcePoint.y} L ${beforeLabelX} ${beforeLabelY}`;
      const path2 = `M ${afterLabelX} ${afterLabelY} L ${targetPoint.x} ${targetPoint.y}`;
      const fullPath = `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`;

      return (
        <>
          <path d={fullPath} style={hitAreaStyle} />
          <path
            id={`${id}-path1`}
            className="react-flow__edge-path"
            d={path1}
            style={visibleStyle}
          />
          <path
            id={`${id}-path2`}
            className="react-flow__edge-path"
            d={path2}
            style={visibleStyle}
          />
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
                pointerEvents: "all",
                fontSize: "12px",
                fontWeight: 500,
                color: baseStrokeColor,
                background: "transparent",
                padding: "4px 8px",
                cursor: "pointer",
                zIndex: 1000,
              }}
              className="nodrag nopan edge-weight-label"
              data-edge-id={id}
            >
              {label}
            </div>
          </EdgeLabelRenderer>
        </>
      );
    }

    // No label: plain line (BFS/DFS)
    const path = `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`;
    return (
      <>
        <path d={path} style={hitAreaStyle} />
        <path
          id={id}
          className="react-flow__edge-path"
          d={path}
          style={visibleStyle}
        />
      </>
    );
  }

  // ── Directed mode: arrowhead + split path around label ────────
  // Arrow dimensions
  const arrowLength = 14;
  const arrowWidth = 8;
  const labelGap = 16;

  // Angle from source intersection to target intersection
  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  const angle = Math.atan2(dy, dx);

  // Edge line ends at the base of the arrowhead
  const lineEndX = targetPoint.x - Math.cos(angle) * arrowLength;
  const lineEndY = targetPoint.y - Math.sin(angle) * arrowLength;

  // Midpoint for label
  const midX = (sourcePoint.x + lineEndX) / 2;
  const midY = (sourcePoint.y + lineEndY) / 2;

  // Split path around label
  const halfGap = labelGap / 2;
  const beforeLabelX = midX - Math.cos(angle) * halfGap;
  const beforeLabelY = midY - Math.sin(angle) * halfGap;
  const afterLabelX = midX + Math.cos(angle) * halfGap;
  const afterLabelY = midY + Math.sin(angle) * halfGap;

  const path1 = `M ${sourcePoint.x} ${sourcePoint.y} L ${beforeLabelX} ${beforeLabelY}`;
  const path2 = `M ${afterLabelX} ${afterLabelY} L ${lineEndX} ${lineEndY}`;
  const fullPath = `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`;

  // Arrowhead polygon: tip at target border, base at arrowLength back
  const perpAngle = angle + Math.PI / 2;
  const arrowPoints = [
    `${targetPoint.x},${targetPoint.y}`,
    `${lineEndX + Math.cos(perpAngle) * arrowWidth},${lineEndY + Math.sin(perpAngle) * arrowWidth}`,
    `${lineEndX - Math.cos(perpAngle) * arrowWidth},${lineEndY - Math.sin(perpAngle) * arrowWidth}`,
  ].join(" ");

  return (
    <>
      <path d={fullPath} style={hitAreaStyle} />
      <path
        id={`${id}-path1`}
        className="react-flow__edge-path"
        d={path1}
        style={visibleStyle}
      />
      <path
        id={`${id}-path2`}
        className="react-flow__edge-path"
        d={path2}
        style={visibleStyle}
      />
      <polygon points={arrowPoints} fill={strokeColor} stroke="none" />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
              pointerEvents: "all",
              fontSize: "12px",
              fontWeight: 500,
              color: baseStrokeColor,
              background: "transparent",
              padding: "4px 8px",
              cursor: "pointer",
              zIndex: 1000,
            }}
            className="nodrag nopan edge-weight-label"
            data-edge-id={id}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
