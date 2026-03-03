import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { swapByIndex } from "./swap";

export const generateBubbleSortSteps = (
  nodes: Node<SortNodeData>[],
  positionFromIndex: (index: number) => { x: number; y: number },
) => {
  let arr: Node<SortNodeData>[] = [...nodes]
    .map(
      (node): Node<SortNodeData> => ({
        ...node,
        position: positionFromIndex(node.data.index),
        data: {
          ...node.data,
          status: "idle",
        },
      }),
    )
    .sort((a, b) => a.data.index - b.data.index);

  const steps: Node<SortNodeData>[][] = [];

  const pushStep = () => {
    steps.push(
      arr.map((node) => ({
        ...node,
        position: { ...node.position },
        data: { ...node.data }, // clone
      })),
    );
  };

  pushStep(); // initial

  const n = arr.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const a = arr[j];
      const b = arr[j + 1];

      // compare
      arr = arr.map((node) =>
        node.id === a.id || node.id === b.id
          ? { ...node, data: { ...node.data, status: "compare" as const } }
          : node,
      );
      pushStep();

      if (a.data.value > b.data.value) {
        arr = swapByIndex(arr, j, j + 1, positionFromIndex);

        arr = arr.map((node) =>
          node.id === a.id || node.id === b.id
            ? { ...node, data: { ...node.data, status: "swap" as const } }
            : node,
        );

        pushStep();
      }

      // reset
      arr = arr.map((node) =>
        node.id === a.id || node.id === b.id
          ? { ...node, data: { ...node.data, status: "idle" as const } }
          : node,
      );

      pushStep();
    }

    // Mark the last element of the unsorted part as sorted
    const sortedNodeIndex = n - i - 1;
    const sortedNodeId = arr[sortedNodeIndex].id;
    arr = arr.map((node) =>
      node.id === sortedNodeId
        ? { ...node, data: { ...node.data, status: "sorted" as const } }
        : node,
    );
    pushStep();
  }

  return steps;
};
