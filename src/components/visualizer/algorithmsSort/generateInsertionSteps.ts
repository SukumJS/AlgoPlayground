import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { swapByIndex } from "./swap";

export const generateInsertionSteps = (
    nodes: Node<SortNodeData>[],
    positionFromIndex: (index: number) => { x: number; y: number }
) => {
    const BASE_Y = 5;
    const LIFT_OFFSET = 40;
    let arr: Node<SortNodeData>[] = [...nodes]
        .map((node): Node<SortNodeData> => ({
            ...node,
            position: positionFromIndex(node.data.index),
            data: {
                ...node.data,
                status: "idle",
            },
        }))
        .sort((a, b) => a.data.index - b.data.index);

    const steps: Node<SortNodeData>[][] = [];

    const pushStep = () => {
        steps.push(
            arr.map((node) => ({
                ...node,
                position: { ...node.position },
                data: { ...node.data },
            }))
        );
    };
    pushStep(); // initial

    const n = arr.length;

    for (let i = 1; i < n; i++) {
        let j = i;

        while (j > 0 && arr[j - 1].data.value > arr[j].data.value) {
            const left = arr[j - 1];
            const right = arr[j];

            // 1️⃣ Compare
            arr = arr.map((node) =>
                node.id === left.id || node.id === right.id
                    ? { ...node, data: { ...node.data, status: "compare" as const } }
                    : node
            );
            pushStep();

            // 2️⃣ Lift
            arr = arr.map((node) => {
                if (node.id === left.id) {
                    return {
                        ...node,
                        data: { ...node.data, status: "swap" as const },
                        position: {
                            x: node.position.x,
                            y: BASE_Y - LIFT_OFFSET,
                        },
                    };
                }
                if (node.id === right.id) {
                    return {
                        ...node,
                        data: { ...node.data, status: "swap" as const },
                        position: {
                            x: node.position.x,
                            y: BASE_Y + LIFT_OFFSET,
                        },
                    };
                }
                return node;
            });
            pushStep();

            // 3️⃣ Horizontal Slide
            arr = arr.map((node) => {
                if (node.id === left.id) {
                    return {
                        ...node,
                        position: {
                            x: positionFromIndex(j).x,
                            y: BASE_Y - LIFT_OFFSET,
                        },
                    };
                }
                if (node.id === right.id) {
                    return {
                        ...node,
                        position: {
                            x: positionFromIndex(j - 1).x,
                            y: BASE_Y + LIFT_OFFSET,
                        },
                    };
                }
                return node;
            });
            pushStep();

            // 4️⃣ Drop
            arr = arr.map((node) => {
                if (node.id === left.id) {
                    return {
                        ...node,
                        position: positionFromIndex(j),
                    };
                }
                if (node.id === right.id) {
                    return {
                        ...node,
                        position: positionFromIndex(j - 1),
                    };
                }
                return node;
            });
            pushStep();

            // Commit swap in data order
            arr = swapByIndex(arr, j - 1, j, positionFromIndex);

            // 5️⃣ Reset
            arr = arr.map((node) =>
                node.id === left.id || node.id === right.id
                    ? { ...node, data: { ...node.data, status: "idle" as const } }
                    : node
            );
            pushStep();

            j--;
        }
    }

    // Mark sorted
    arr = arr.map((node) => ({
        ...node,
        data: { ...node.data, status: "sorted" as const },
    }));
    pushStep();

    return steps;
};