
import type { NodeProps } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
const STATUS_BG: Record<SortNodeData["status"], string> = {
  idle: "#D9E363",
  compare: "#62A2F7",
  swap: "#F19F72",
  sorted: "#D9E363",
  merge: "#B784F7",
};

export default function CustomNode({ data }: NodeProps) {
  const nodeData = data as SortNodeData;

  return (
    <div
      className="
        flex text-[#222121] text-2xl font-semibold
        justify-center items-center border-2 border-[#5D5D5D]
        w-14 h-14 rounded-lg cursor-grab
        transition-transform duration-300 ease-in-out
      "
      style={{
        backgroundColor: STATUS_BG[nodeData.status],
      }}
    >
      {nodeData.value}
    </div>
  );
}


