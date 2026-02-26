import type { ExplanationContext } from "../explanationUtils";
import type { SortNodeData } from "@/src/components/shared/sortNode";

export function explainInsertionSort(ctx: ExplanationContext<SortNodeData>): string | undefined {
    const {
        newlyComparing,
        newlySwapping,
        justResetToIdle,
        prevNodes,
    } = ctx;

    if (newlyComparing.length === 2) {
        const [a, b] = newlyComparing.sort(
            (n1, n2) => n1.data.index - n2.data.index
        );
        return `Taking element ${b.data.value} and finding its correct position in the sorted part by comparing with ${a.data.value}.`;
    }

    if (newlySwapping.length === 2) {
        const nodeToInsert = newlySwapping.find(
            n => n.position.y !== prevNodes.find(pn => pn.id === n.id)?.position.y
        );
        if (nodeToInsert) {
            return `Element ${nodeToInsert.data.value} is smaller. Preparing to shift elements to the right.`;
        }
    }

    if (
        justResetToIdle.length === 2 &&
        prevNodes.filter(n => n.data.status === 'swap').length === 2
    ) {
        return `Element has been inserted into its correct position.`;
    }

    return undefined;
}
