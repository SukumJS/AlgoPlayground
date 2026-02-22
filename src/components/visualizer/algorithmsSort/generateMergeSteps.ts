import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

const NODE_WIDTH = 65;
const LEVEL_HEIGHT = 100;
const BLOCK_GAP = 60;
const BASE_Y = 5;

export const generateMergeSteps = (
    nodes: Node<SortNodeData>[],
    positionFromIndex: (index: number) => { x: number; y: number }
) => {
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
    let level = 0;

    for (let size = 1; size < n; size *= 2) {
        level++;

        for (let left = 0; left < n; left += size * 2) {
            const mid = Math.min(left + size - 1, n - 1);
            const right = Math.min(left + size * 2 - 1, n - 1);
            const blockIndex = Math.floor(left / (size * 2));

            let temp: typeof arr = [];
            let i = left;
            let j = mid + 1;

            // 🔹 Compare phase
            while (i <= mid && j <= right) {
                const leftNode = arr[i];
                const rightNode = arr[j];

                arr = arr.map((node) =>
                    node.id === leftNode.id || node.id === rightNode.id
                        ? { ...node, data: { ...node.data, status: "compare" as const } }
                        : node
                );
                pushStep();

                if (leftNode.data.value <= rightNode.data.value) {
                    temp.push(arr[i++]);
                } else {
                    temp.push(arr[j++]);
                }

                arr = arr.map((node) =>
                    node.id === leftNode.id || node.id === rightNode.id
                        ? { ...node, data: { ...node.data, status: "idle" as const } }
                        : node
                );
                pushStep();
            }

            while (i <= mid) temp.push(arr[i++]);
            while (j <= right) temp.push(arr[j++]);

            // 🔹 Commit logical array
            for (let k = 0; k < temp.length; k++) {
                arr[left + k] = {
                    ...temp[k],
                    position: { ...temp[k].position },
                    data: { ...temp[k].data },
                };
            }

            // 🔹 Merge animation (ลง level ใหม่)
            for (let k = 0; k < temp.length; k++) {
                const newIndex = left + k;
                const nodeToMove = temp[k];

                arr = arr.map((node) =>
                    node.id === nodeToMove.id
                        ? {
                            ...node,
                            position: {
                                x: newIndex * NODE_WIDTH + blockIndex * BLOCK_GAP,
                                y: BASE_Y + level * LEVEL_HEIGHT,
                            },
                            data: {
                                ...node.data,
                                index: newIndex,
                                status: "merge" as const,
                            },
                        }
                        : node
                );

                pushStep();
            }

            // 🔹 Reset block
            arr = arr.map((node) =>
                temp.some((t) => t.id === node.id)
                    ? { ...node, data: { ...node.data, status: "idle" as const } }
                    : node
            );

            pushStep();
        }
    }

    // 🔹 Final state (กลับ base line)
    arr = arr.map((node) => ({
        ...node,
        position: positionFromIndex(node.data.index),
        data: { ...node.data, status: "sorted" as const },
    }));

    pushStep();

    return steps;
};