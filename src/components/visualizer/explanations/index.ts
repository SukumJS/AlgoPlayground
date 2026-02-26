import { explainSort } from "./sort";
import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

// If we later add other categories (tree, graph) we can extend this dispatcher.

export function getExplanation(
    category: string,
    algoType: string | null,
    stepIndex: number,
    steps: unknown[][]
): string | undefined {
    switch (category) {
        case "sort":
            return explainSort(algoType, stepIndex, steps as Node<SortNodeData>[][]);
        // future cases: "tree", "graph" ...
        default:
            return undefined;
    }
}
