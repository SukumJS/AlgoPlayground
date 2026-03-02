import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { swapByIndex } from "./swap";

export const generateSelectionSteps = (
  nodes: Node<SortNodeData>[],
  positionFromIndex: (index: number) => { x: number; y: number }
) => {
  const BASE_Y = 5;
  const LIFT_OFFSET = 40;

  // reset + sort by index
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

  // deep clone ทุก step
  const pushStep = () => {
    steps.push(
      arr.map((node) => ({
        ...node,
        position: { ...node.position },
        data: { ...node.data },
      }))
    );
  };

  pushStep(); // initial state

  const n = arr.length;

  for (let i = 0; i < n; i++) {
    let minIndex = i;


    //Find minimum
    for (let j = i + 1; j < n; j++) {
      const nodeJ = arr[j];
      const nodeMin = arr[minIndex];

      // compare
      arr = arr.map((node) =>
        node.id === nodeJ.id || node.id === nodeMin.id
          ? { ...node, data: { ...node.data, status: "compare" } }
          : node
      );
      pushStep();

      if (nodeJ.data.value < nodeMin.data.value) {
        minIndex = j;
      }

      // reset compare
      arr = arr.map((node) =>
        node.id === nodeJ.id || node.id === nodeMin.id
          ? { ...node, data: { ...node.data, status: "idle" } }
          : node
      );
      pushStep();
    }

    // 🔹 Swap if needed
    if (minIndex !== i) {
      const nodeI = arr[i];
      const nodeMin = arr[minIndex];

      // Lift
      arr = arr.map((node) => {
        if (node.id === nodeI.id) {
          return {
            ...node,
            data: { ...node.data, status: "swap" },
            position: {
              x: node.position.x,
              y: BASE_Y - LIFT_OFFSET,
            },
          };
        }
        if (node.id === nodeMin.id) {
          return {
            ...node,
            data: { ...node.data, status: "swap" },
            position: {
              x: node.position.x,
              y: BASE_Y + LIFT_OFFSET,
            },
          };
        }
        return node;
      });
      pushStep();

      // Horizontal slide
      arr = arr.map((node) => {
        if (node.id === nodeI.id) {
          return {
            ...node,
            position: {
              x: positionFromIndex(minIndex).x,
              y: BASE_Y - LIFT_OFFSET,
            },
          };
        }
        if (node.id === nodeMin.id) {
          return {
            ...node,
            position: {
              x: positionFromIndex(i).x,
              y: BASE_Y + LIFT_OFFSET,
            },
          };
        }
        return node;
      });
      pushStep();

      // Drop
      arr = arr.map((node) => {
        if (node.id === nodeI.id) {
          return {
            ...node,
            position: positionFromIndex(minIndex),
          };
        }
        if (node.id === nodeMin.id) {
          return {
            ...node,
            position: positionFromIndex(i),
          };
        }
        return node;
      });
      pushStep();

      // Commit logical swap
      arr = swapByIndex(arr, i, minIndex, positionFromIndex);

      const swappedA = arr[i];
      const swappedB = arr[minIndex];

      // Reset status
      arr = arr.map((node) =>
        node.id === swappedA.id || node.id === swappedB.id
          ? { ...node, data: { ...node.data, status: "idle" } }
          : node
      );
      pushStep();
    }

    // 🔹 Mark sorted
    arr = arr.map((node) =>
      node.data.index === i
        ? { ...node, data: { ...node.data, status: "sorted" } }
        : node
    );
    pushStep();
  }

  return steps;
};