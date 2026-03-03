import React from "react";
import type { NodeProps, Node } from "@xyflow/react";

// 1. ประกาศและ Export Type ออกไปให้ไฟล์อื่น (เช่น PlaygroundSort) ใช้งานได้
export type SortNodeData = {
  value: number;
  index: number;
  status: "idle" | "compare" | "swap" | "merge" | "sorted";
  level?: number;
  currentLevel?: number;
};

// 2. Map สีตาม Status
const STATUS_BG: Record<SortNodeData["status"], string> = {
  idle: "#D9E363",
  compare: "#62A2F7",
  swap: "#F19F72",
  sorted: "#D9E363",
  merge: "#F19F72",
};

export default function SortNode({ data }: NodeProps<Node<SortNodeData>>) {
  return (
    <div
      className="
        flex text-[#222121] text-2xl font-semibold
        justify-center items-center border-2 border-[#5D5D5D]
        w-14 h-14 rounded-lg cursor-grab
        transition-transform duration-300 ease-in-out
      "
      style={{
        backgroundColor: STATUS_BG[data.status],
      }}
    >
      {data.value}
    </div>
  );
}
