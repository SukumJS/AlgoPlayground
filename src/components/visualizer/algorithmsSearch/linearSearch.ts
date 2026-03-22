import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export function generateLinearSearchSteps(
  nodes: Node<SortNodeData>[],
  target: number,
) {
  const steps: Node<SortNodeData>[][] = [];
  let currentNodes = JSON.parse(JSON.stringify(nodes));

  steps.push(JSON.parse(JSON.stringify(currentNodes))); // ภาพตั้งต้น

  for (let i = 0; i < currentNodes.length; i++) {
    // Current State
    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    currentNodes[i].data.status = "compare";
    steps.push(currentNodes);

    // Processing
    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    currentNodes[i].data.status = "processing";
    steps.push(currentNodes);

    // Found/Discarded
    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    if (Number(currentNodes[i].data.value) === target) {
      currentNodes[i].data.status = "found";
      steps.push(currentNodes);
      break;
    } else {
      currentNodes[i].data.status = "discarded";
      steps.push(currentNodes);
    }
  }

  return steps;
}
