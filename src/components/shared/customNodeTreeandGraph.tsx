import React from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

type CustomNodeData = {
  label: string;
  variant?: "square" | "circle";
  isHighlighted?: boolean;
  isGlowing?: boolean;
  isDanger?: boolean;
  highlightColor?: string;
  balanceFactor?: number;
  /** Graph algorithm animation state (set by useAlgorithmAnimation) */
  animationState?: "default" | "visiting" | "visited" | "target-found";
};

/** Map graph animation states to visual colors */
const ANIMATION_STATE_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  visiting: { bg: "#F7AD45", border: "#D4912B", text: "#222121" },
  visited: { bg: "#62A2F7", border: "#4A85D6", text: "#FFFFFF" },
  "target-found": { bg: "#4CAF7D", border: "#388E5C", text: "#FFFFFF" },
};

export default function CustomNode({ data }: NodeProps<Node<CustomNodeData>>) {
  const isCircle = data.variant === "circle";

  // Determine colors based on highlight status
  let bgColorClass = data.isDanger ? "bg-[#BF1A1A]" : "bg-[#D9E363]";
  const textColorClass = data.isDanger ? "text-white" : "text-[#222121]";
  // Border is ALWAYS #5D5D5D — never changes regardless of highlight or danger state
  const borderColorClass = "border-[#5D5D5D]";

  const inlineStyle: React.CSSProperties = {
    boxShadow: data.isGlowing
      ? "0 0 20px rgba(40, 40, 40, 0.8), 0 0 40px rgba(55, 55, 55, 0.5)"
      : undefined,
  };

  // Graph animation state takes priority (set by useAlgorithmAnimation)
  const animColors =
    data.animationState && data.animationState !== "default"
      ? ANIMATION_STATE_COLORS[data.animationState]
      : null;

  if (animColors) {
    bgColorClass = "";
    borderColorClass = "";
    textColorClass = "";
    inlineStyle.backgroundColor = animColors.bg;
    inlineStyle.borderColor = animColors.border;
    inlineStyle.color = animColors.text;
  } else if (data.isHighlighted && data.highlightColor) {
    if (data.highlightColor.startsWith("#")) {
      bgColorClass = "";
      inlineStyle.backgroundColor = data.highlightColor;
      // Text stays #222121 — do NOT set inlineStyle.color
    } else {
      switch (data.highlightColor) {
        case "blue":
          bgColorClass = "bg-blue-400";
          break;
        case "red":
          bgColorClass = "bg-red-500";
          break;
        case "yellow":
          bgColorClass = "bg-yellow-300";
          break;
        case "green":
          bgColorClass = "bg-green-500";
          break;
      }
      // textColorClass stays as-is (original dark text)
    }
  }

  const borderWidthClass =
    animColors || data.isHighlighted || data.isDanger ? "border-4" : "border-2";

  return (
    <div
      className={`relative shrink-0 flex ${textColorClass} text-2xl font-semibold justify-center items-center ${borderWidthClass} ${borderColorClass} ${bgColorClass} w-14 h-14 cursor-grab transition-colors duration-200 ${isCircle ? "rounded-full" : "rounded-lg"}`}
      style={inlineStyle}
    >
      {/* Target handles - positioned at circle corners (45° angles) */}
      {/* For 56px circle, 45° point is at ~71% from center = ~20px offset from edges */}
      <Handle
        id="target-top-left"
        type="target"
        position={Position.Top}
        className="bg-transparent! border-0! w-1! h-1!"
        style={{
          left: "15%",
          top: "15%",
        }}
      />
      <Handle
        id="target-top-right"
        type="target"
        position={Position.Top}
        className="bg-transparent! border-0! w-1! h-1!"
        style={{
          left: "85%",
          top: "15%",
        }}
      />

      {data.label}

      {/* Balance factor badge — shown only during AVL balance-check animations */}
      {data.balanceFactor !== undefined && (
        <div
          className={`absolute -top-3 -right-3 w-6 h-6 rounded-full border text-xs flex items-center justify-center font-bold font-mono z-50 shadow-sm pointer-events-none ${
            Math.abs(data.balanceFactor as number) > 1
              ? "bg-red-100 border-red-400 text-red-800"
              : "bg-blue-100 border-blue-400 text-blue-800"
          }`}
        >
          {(data.balanceFactor as number) > 0
            ? `+${data.balanceFactor}`
            : data.balanceFactor}
        </div>
      )}

      {/* Source handles - positioned at circle corners (45° angles) */}
      <Handle
        id="source-bottom-left"
        type="source"
        position={Position.Bottom}
        className="bg-transparent! border-0! w-1! h-1!"
        style={{
          left: "15%",
          top: "85%",
        }}
      />
      <Handle
        id="source-bottom-right"
        type="source"
        position={Position.Bottom}
        className="bg-transparent! border-0! w-1! h-1!"
        style={{
          left: "85%",
          top: "85%",
        }}
      />
    </div>
  );
}
