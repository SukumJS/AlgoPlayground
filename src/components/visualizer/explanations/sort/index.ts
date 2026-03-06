import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { makeContext, ExplanationContext } from "../explanationUtils";
import { explainBubbleSort } from "./bubbleSort";
import { explainSelectionSort } from "./selectionSort";
import { explainInsertionSort } from "./insertionSort";
import { explainMergeSort } from "./mergeSort";

export type ExplanationFn = (
  ctx: ExplanationContext<SortNodeData>,
) => string | undefined;

const explanationMap: Record<string, ExplanationFn> = {
  "bubble-sort": explainBubbleSort,
  "selection-sort": explainSelectionSort,
  "insertion-sort": explainInsertionSort,
  "merge-sort": explainMergeSort,
};

/**
 * Public entry point for sorting explanations.  Consumers provide the full steps
 * array and the current index; this helper figures out which algorithm-specific
 * function to call and also handles the generic start/end messages.
 */
export function explainSort(
  algoType: string | null,
  stepIndex: number,
  steps: Node<SortNodeData>[][],
): string | undefined {
  if (steps.length === 0 || stepIndex >= steps.length) return "";
  if (stepIndex === 0) return "This is the initial unsorted array.";

  const currentNodes = steps[stepIndex];
  const prevNodes = steps[stepIndex - 1];

  // final step check: all sorted
  const isFinalStep = stepIndex === steps.length - 1;
  if (isFinalStep && currentNodes.every((n) => n.data.status === "sorted")) {
    return "The array is now fully sorted.";
  }

  const explFn = algoType ? explanationMap[algoType] : undefined;
  if (!explFn) return undefined;

  const ctx = makeContext(currentNodes, prevNodes);
  return explFn(ctx);
}
