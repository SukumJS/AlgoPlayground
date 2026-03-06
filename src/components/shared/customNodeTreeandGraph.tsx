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
};

export default function CustomNode({ data }: NodeProps<Node<CustomNodeData>>) {
  const isCircle = data.variant === "circle";

  // Determine colors based on highlight status
  let bgColorClass = data.isDanger ? "bg-[#BF1A1A]" : "bg-[#D9E363]";
  let textColorClass = data.isDanger ? "text-white" : "text-[#222121]";
  let borderColorClass = data.isDanger
    ? "border-[#BF1A1A]"
    : "border-[#5D5D5D]";

  const inlineStyle: React.CSSProperties = {
    boxShadow: data.isGlowing
      ? "0 0 20px rgba(40, 40, 40, 0.8), 0 0 40px rgba(55, 55, 55, 0.5)"
      : undefined,
  };

  // Override with highlight colors if highlighted
  if (data.isHighlighted && data.highlightColor) {
    if (data.highlightColor.startsWith("#")) {
      bgColorClass = "";
      borderColorClass = "";
      textColorClass = "";

      inlineStyle.backgroundColor = data.highlightColor;
      inlineStyle.borderColor = data.highlightColor;

      if (data.highlightColor.toUpperCase() === "#F7AD45") {
        inlineStyle.color = "#222121";
      } else {
        inlineStyle.color = "white";
      }
    } else {
      switch (data.highlightColor) {
        case "blue":
          bgColorClass = "bg-blue-400";
          borderColorClass = "border-blue-600";
          textColorClass = "text-white";
          break;
        case "red":
          bgColorClass = "bg-red-500";
          borderColorClass = "border-red-700";
          textColorClass = "text-white";
          break;
        case "yellow":
          bgColorClass = "bg-yellow-300";
          borderColorClass = "border-yellow-600";
          textColorClass = "text-gray-800";
          break;
        case "green":
          bgColorClass = "bg-green-500";
          borderColorClass = "border-green-700";
          textColorClass = "text-white";
          break;
      }
    }
  }

  const borderWidthClass =
    data.isHighlighted || data.isDanger ? "border-4" : "border-2";

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
          className="absolute -top-3 -right-3 flex items-center justify-center text-xs font-semibold rounded-full w-6 h-6 border-2"
          style={{
            backgroundColor:
              Math.abs(data.balanceFactor) > 1 ? "#EF4444" : "#4CAF7D",
            borderColor:
              Math.abs(data.balanceFactor) > 1 ? "#DC2626" : "#388E5C",
            color: "white",
            fontSize: "14px",
            lineHeight: 1,
            zIndex: 10,
          }}
        >
          {data.balanceFactor > 0
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
