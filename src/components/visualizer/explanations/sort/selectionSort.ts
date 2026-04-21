import type { ExplanationContext } from "../explanationUtils";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export function explainSelectionSort(
  ctx: ExplanationContext<SortNodeData>,
): string | undefined {
  const {
    newlyComparing,
    newlySwapping,
    newlySorted,
    justResetToIdle,
    getNodesByStatus,
  } = ctx;

  if (newlyComparing.length > 0) {
    const [a, b] = newlyComparing;
    return `Searching for minimum in the unsorted part. Comparing ${a.data.value} and ${b.data.value}.`;
  }

  if (newlySwapping.length === 2) {
    return `Minimum for the current pass is found. Swapping it with the first unsorted element.`;
  }

  if (newlySorted.length > 0) {
    return `Element ${newlySorted[0].data.value} is now in its correct sorted position.`;
  }

  if (justResetToIdle.length > 0 && getNodesByStatus("compare").length > 0) {
    return `Continuing search for the minimum.`;
  }

  return undefined;
}
