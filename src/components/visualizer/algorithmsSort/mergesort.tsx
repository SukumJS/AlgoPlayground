import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

type MergeSortParams = {
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  delayRef: React.MutableRefObject<number>;
  isRunningRef: React.MutableRefObject<boolean>;
  positionFromIndex: (index: number) => { x: number; y: number };
};

const NODE_WIDTH = 65;
const LEVEL_HEIGHT = 100;
const BLOCK_GAP = 60;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const runMergeSort = async ({
  nodes,
  setNodes,
  delayRef,
  isRunningRef,
  positionFromIndex,
}: MergeSortParams) => {
  let arr = [...nodes].sort((a, b) => a.data.index - b.data.index);
  const n = arr.length;

  let level = 0;

  await sleep(delayRef.current);

  for (let size = 1; size < n; size *= 2) {
    level++;

    for (let left = 0; left < n; left += size * 2) {
      if (!isRunningRef.current) return;

      const mid = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + size * 2 - 1, n - 1);
      const blockIndex = Math.floor(left / (size * 2));

      let temp: typeof arr = [];
      let i = left;
      let j = mid + 1;

      //  COMPARE PHASE
      while (i <= mid && j <= right) {
        if (!isRunningRef.current) return;

        const leftNode = arr[i];
        const rightNode = arr[j];

        // highlight compare
        setNodes(prev =>
          prev.map(node =>
            node.id === leftNode.id || node.id === rightNode.id
              ? {
                  ...node,
                  data: { ...node.data, status: "compare" },
                }
              : node
          )
        );

        await sleep(delayRef.current);

        if (leftNode.data.value <= rightNode.data.value) {
          temp.push(arr[i++]);
        } else {
          temp.push(arr[j++]);
        }

        // reset compare -> idle
        setNodes(prev =>
          prev.map(node =>
            node.id === leftNode.id || node.id === rightNode.id
              ? {
                  ...node,
                  data: { ...node.data, status: "idle" },
                }
              : node
          )
        );
      }

      while (i <= mid) temp.push(arr[i++]);
      while (j <= right) temp.push(arr[j++]);

      // เขียนกลับ logical array
      for (let k = 0; k < temp.length; k++) {
        arr[left + k] = temp[k];
      }

      //  MERGE ANIMATION
      for (let k = 0; k < temp.length; k++) {
        if (!isRunningRef.current) return;

        const newIndex = left + k;
        const nodeToMove = temp[k];

        setNodes(prev =>
          prev.map(node =>
            node.id === nodeToMove.id
              ? {
                  ...node,
                  position: {
                    x:
                      newIndex * NODE_WIDTH +
                      blockIndex * BLOCK_GAP,
                    y: 5 + level * LEVEL_HEIGHT,
                  },
                  data: {
                    ...node.data,
                    index: newIndex,
                    status: "merge",
                  },
                }
              : node
          )
        );

        await sleep(delayRef.current);
      }

      //  RESET BLOCK BACK TO IDLE
      setNodes(prev =>
        prev.map(node =>
          temp.some(t => t.id === node.id)
            ? {
                ...node,
                data: { ...node.data, status: "idle" },
              }
            : node
        )
      );

      await sleep(delayRef.current);
    }
  }

  // FINAL STATE
  setNodes(prev =>
    prev.map(node => ({
      ...node,
      position: positionFromIndex(node.data.index),
      data: { ...node.data, status: "sorted" },
    }))
  );
};
