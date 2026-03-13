import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export function generateBinarySearchSteps(
  nodes: Node<SortNodeData>[],
  target: number,
) {
  const steps: Node<SortNodeData>[][] = [];

  let currentNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
  currentNodes = JSON.parse(JSON.stringify(currentNodes));

  steps.push(JSON.parse(JSON.stringify(currentNodes)));

  let left = 0;
  let right = currentNodes.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    currentNodes[mid].data.status = "compare";
    steps.push(JSON.parse(JSON.stringify(currentNodes)));

    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    currentNodes[mid].data.status = "processing";
    steps.push(JSON.parse(JSON.stringify(currentNodes)));

    const midValue = Number(currentNodes[mid].data.value);

    currentNodes = JSON.parse(JSON.stringify(currentNodes));

    if (midValue === target) {
      currentNodes[mid].data.status = "found"; // สีเขียว
      steps.push(JSON.parse(JSON.stringify(currentNodes)));
      break;
    } else if (midValue < target) {
      // ตัดครึ่งซ้ายเป็นสีเทา
      for (let i = left; i <= mid; i++) {
        currentNodes[i].data.status = "discarded";
      }
      left = mid + 1;
      steps.push(JSON.parse(JSON.stringify(currentNodes)));
    } else {
      // ตัดครึ่งขวาเป็นสีเทา
      for (let i = mid; i <= right; i++) {
        currentNodes[i].data.status = "discarded";
      }
      right = mid - 1;
      steps.push(JSON.parse(JSON.stringify(currentNodes)));
    }
  }

  return steps;
}
