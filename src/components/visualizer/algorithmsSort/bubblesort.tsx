import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { swapByIndex } from "./swap";

type BubbleSortParams = {
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  positionFromIndex: (index: number) => { x: number; y: number };
  delayRef: React.MutableRefObject<number>;
  isRunningRef: React.MutableRefObject<boolean>;
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const runBubbleSort = async ({
  nodes,
  setNodes,
  positionFromIndex,
  delayRef,
  isRunningRef,
}: BubbleSortParams) => {
  let arr = [...nodes].map((node) => ({
    ...node,
    position: positionFromIndex(node.data.index),
  }));

  const n = arr.length;

  for (let i = 0; i < n; i++) {
    if (!isRunningRef.current) return;

    for (let j = 0; j < n - i - 1; j++) {
      if (!isRunningRef.current) return;

      const a = arr[j];
      const b = arr[j + 1];

      // Highlight compare
      setNodes((prev) =>
        prev.map((node) =>
          node.id === a.id || node.id === b.id
            ? { ...node, data: { ...node.data, status: "compare" } }
            : node
        )
      );

      await sleep(delayRef.current);

      if (a.data.value > b.data.value) {
        //  swap logic ใน arr ก่อน
        arr = swapByIndex(arr, j, j + 1, positionFromIndex);

        //  update position จริงของทั้งคู่
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id === a.id) {
              return {
                ...node,
                position: positionFromIndex(j + 1),
                data: {
                  ...node.data,
                  index: j + 1,
                  status: "swap",
                },
              };
            }
            if (node.id === b.id) {
              return {
                ...node,
                position: positionFromIndex(j),
                data: {
                  ...node.data,
                  index: j,
                  status: "swap",
                },
              };
            }
            return node;
          })
        );

        await sleep(delayRef.current);
      }

      // reset status
      setNodes((prev) =>
        prev.map((node) =>
          node.id === a.id || node.id === b.id
            ? { ...node, data: { ...node.data, status: "idle" } }
            : node
        )
      );
    }
  }
};
