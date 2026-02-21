import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { swapByIndex } from "./swap";

type BubbleSortParams = {
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  positionFromIndex: (index: number) => { x: number; y: number };
  delayRef: React.MutableRefObject<number>;
  isRunningRef: React.MutableRefObject<boolean>;
  executionId: number;
  executionIdRef: React.MutableRefObject<number>;
};
const sleepWithPause = (
  delay: number,
  isRunningRef: React.MutableRefObject<boolean>
) => {
  return new Promise<void>((resolve) => {
    const start = Date.now();

    const check = () => {
      // ถ้า pause อยู่ → รอจนกว่าจะ resume
      if (!isRunningRef.current) {
        setTimeout(check, 10);
        return;
      }

      // ถ้าครบ delay แล้ว → ไป step ต่อไป
      if (Date.now() - start >= delay) {
        resolve();
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
};

export const runBubbleSort = async ({
  nodes,
  setNodes,
  positionFromIndex,
  delayRef,
  isRunningRef,
  executionId,
  executionIdRef,
}: BubbleSortParams) => {

  // clone nodes แล้ว snap ตำแหน่งให้ตรง index
  let arr = [...nodes].map((node) => ({
    ...node,
    position: positionFromIndex(node.data.index),
  }));

  const n = arr.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {

      if (executionId !== executionIdRef.current) return;

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

      await sleepWithPause(delayRef.current, isRunningRef);

      if (executionId !== executionIdRef.current) return;

      if (a.data.value > b.data.value) {

        // swap logic ใน arr ก่อน
        arr = swapByIndex(arr, j, j + 1, positionFromIndex);

        // update position จริงของทั้งคู่
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

        // 🔥 ใช้ sleepWithPause แทน
        await sleepWithPause(delayRef.current, isRunningRef);
        if (executionId !== executionIdRef.current) return;
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