import type { ExplanationContext } from "../explanationUtils";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export function explainMergeSort(ctx: ExplanationContext<SortNodeData>): string | undefined {
    const { newlyComparing, newlyMerging, justResetToIdle, currentNodes, prevNodes } = ctx;

    if (newlyComparing.length === 2) {
        const [a, b] = newlyComparing;
        return `Comparing ${a.data.value} and ${b.data.value} from two subarrays to decide merge order.`;
    }

    if (newlyMerging.length > 0) {
        return `Merging sorted subarrays.`;
    }

    if (justResetToIdle.length > 0 &&
        prevNodes.filter(n => n.data.status === 'merge').length > 0) {
        return `A merged subarray is now ready.`;
    }

    return undefined;
}
