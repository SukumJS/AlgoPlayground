import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

type SearchStep = {
  nodes: Node<SortNodeData>[];
  codeLine: number;
};

export function generateLinearSearchSteps(
  nodes: Node<SortNodeData>[],
  target: number,
) {
  const steps: SearchStep[] = [];
  let currentNodes = JSON.parse(JSON.stringify(nodes));

  steps.push({ nodes: JSON.parse(JSON.stringify(currentNodes)), codeLine: 1 }); // ภาพตั้งต้น

  for (let i = 0; i < currentNodes.length; i++) {
    // Current State
    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    currentNodes[i].data.status = "compare";
    steps.push({ nodes: currentNodes, codeLine: 2 });

    // Processing
    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    currentNodes[i].data.status = "processing";
    steps.push({ nodes: currentNodes, codeLine: 3 });

    // Found/Discarded
    currentNodes = JSON.parse(JSON.stringify(currentNodes));
    if (Number(currentNodes[i].data.value) === target) {
      currentNodes[i].data.status = "found";
      steps.push({ nodes: currentNodes, codeLine: 4 });
      break;
    } else {
      currentNodes[i].data.status = "discarded";
      steps.push({ nodes: currentNodes, codeLine: 6 });
    }
  }

  return steps;
}
