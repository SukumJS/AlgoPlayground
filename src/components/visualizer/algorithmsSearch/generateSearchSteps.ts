import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export type SearchStep = {
  nodes: Node<SortNodeData>[];
  codeLine: number;
};

// นำเข้าฟังก์ชันจากไฟล์แยก
import { generateLinearSearchSteps } from "./linearSearch";
import { generateBinarySearchSteps } from "./binarySearch";

export function generateSearchStepsByType(
  algoType: string | null,
  nodes: Node<SortNodeData>[],
  target: number,
): SearchStep[] {
  // รีเซ็ตทุก Node ให้เป็นสี idle ก่อนเริ่มหา
  const initialNodes = nodes.map((node) => ({
    ...node,
    data: { ...node.data, status: "idle" as const },
  }));

  switch (algoType) {
    case "binary-search":
      return generateBinarySearchSteps(initialNodes, target);
    case "linear-search":
    default:
      return generateLinearSearchSteps(initialNodes, target);
  }
}
