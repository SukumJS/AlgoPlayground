import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { generateBubbleSortSteps } from "./generateBubbleSortSteps";
import { generateInsertionSteps } from "./generateInsertionSteps";
import { generateSelectionSteps } from "./generateSelectionSteps";
import { generateMergeSteps } from "./generateMergeSteps";
export function generateStepsByType(
  algoType: string | null,
  nodes: Node<SortNodeData>[],
  positionFromIndex: (index: number) => { x: number; y: number }
) {
  switch (algoType) {
    case "bubble":
      return generateBubbleSortSteps(nodes, positionFromIndex);
    case "insertion":
      return generateInsertionSteps(nodes, positionFromIndex);
    case "selection":
      return generateSelectionSteps(nodes, positionFromIndex);
    case "merge":
      return generateMergeSteps(nodes, positionFromIndex);
    default:
      return generateBubbleSortSteps(nodes, positionFromIndex);
  }
}