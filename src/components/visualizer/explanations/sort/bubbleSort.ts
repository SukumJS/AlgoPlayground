import type { ExplanationContext } from "../explanationUtils";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export function explainBubbleSort(
  ctx: ExplanationContext<SortNodeData>,
): string | undefined {
  const {
    newlyComparing,
    newlySwapping,
    justResetToIdle,
    newlySorted,
    prevNodes,
    getNodesByStatus,
  } = ctx;

  if (newlyComparing.length === 2) {
    const [a, b] = newlyComparing.sort(
      (n1, n2) => n1.data.index - n2.data.index,
    );
    return `Comparing adjacent elements: ${a.data.value} and ${b.data.value}.`;
  }

  if (newlySwapping.length === 2) {
    const [a, b] = prevNodes
      .filter((n) => n.data.status === "compare")
      .sort((n1, n2) => n1.data.index - n2.data.index);
    return `Since ${a.data.value} more than ${b.data.value}, they are swapped.`;
  }

  if (justResetToIdle.length === 2) {
    const prevComparingNodes = getNodesByStatus("compare");
    if (prevComparingNodes.length > 0) {
      return `Elements are in order, no swap needed.`;
    } else if (getNodesByStatus("swap").length > 0) {
      // Previous state was 'swap'.
      return `Swap complete.`;
    }
  }

  if (newlySorted.length > 0) {
    return `The largest unsorted element, ${newlySorted[0].data.value}, has 'bubbled up' to its final position.`;
  }

  return undefined;
}
