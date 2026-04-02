import React from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type LinearNodeData = {
  value: number | string;
  index: number;
  status:
    | "idle"
    | "compare"
    | "swap"
    | "merge"
    | "sorted"
    | "found"
    | "processing"
    | "delete"
    | "discarded";
  hideIndex?: boolean;
};

const STATUS_BG: Record<LinearNodeData["status"], string> = {
  idle: "#D9E363",
  compare: "#62A2F7",
  swap: "#F19F72",
  sorted: "#D9E363",
  merge: "#F19F72",
  found: "#4CAF7D",
  processing: "#F19F72",
  delete: "#F19F72",
  discarded: "#E5E7EB",
};

export default function LinearDSNode({
  data,
}: NodeProps<Node<LinearNodeData>>) {
  const isDiscarded = data.status === "discarded";

  return (
    <div className="flex flex-col items-center relative">
      <div
        className={`
          flex text-2xl font-semibold
          justify-center items-center border-2 border-[#5D5D5D]
          w-14 h-14 rounded-lg cursor-grab
          transition-colors duration-300 ease-in-out
          ${isDiscarded ? "text-gray-400 border-gray-300" : "text-[#222121]"}
        `}
        style={{
          backgroundColor: STATUS_BG[data.status],
        }}
      >
        {data.value}
      </div>

      {!data.hideIndex && (
        <div className="mt-1.5 text-sm font-bold text-gray-600 font-mono">
          [{data.index}]
        </div>
      )}

      {/*Handles สำหรับขาไป (Next) - ขยับขึ้นครึ่งบน (30%) */}
      <Handle
        type="target"
        id="t-next"
        position={Position.Left}
        style={{ top: "30%", background: "transparent", border: "none" }}
      />
      <Handle
        type="source"
        id="s-next"
        position={Position.Right}
        style={{ top: "30%", background: "transparent", border: "none" }}
      />

      {/*Handles สำหรับขากลับ (Prev) - ขยับลงครึ่งล่าง (70%) และสลับฝั่ง */}
      <Handle
        type="target"
        id="t-prev"
        position={Position.Right}
        style={{ top: "70%", background: "transparent", border: "none" }}
      />
      <Handle
        type="source"
        id="s-prev"
        position={Position.Left}
        style={{ top: "70%", background: "transparent", border: "none" }}
      />
    </div>
  );
}
