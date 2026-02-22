import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

type MergeSortParams = {
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  delayRef: React.MutableRefObject<number>;
  isRunningRef: React.MutableRefObject<boolean>;
  positionFromIndex: (index: number) => { x: number; y: number };
  executionId: number;
  executionIdRef: React.MutableRefObject<number>;
};

const NODE_WIDTH = 65;
const LEVEL_HEIGHT = 100;
const BLOCK_GAP = 60;

//  sleep รองรับ pause + execution guard
const sleepWithPause = (
  delay: number,
  isRunningRef: React.MutableRefObject<boolean>,
  executionId: number,
  executionIdRef: React.MutableRefObject<number>
) => {
  return new Promise<void>((resolve) => {
    const start = Date.now();

    const check = () => {
      if (executionId !== executionIdRef.current) {
        resolve();
        return;
      }

      if (!isRunningRef.current) {
        setTimeout(check, 10);
        return;
      }

      if (Date.now() - start >= delay) {
        resolve();
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
};

export const runMergeSort = async ({
  nodes,
  setNodes,
  delayRef,
  isRunningRef,
  positionFromIndex,
  executionId,
  executionIdRef,
}: MergeSortParams) => {

  let arr = [...nodes].sort((a, b) => a.data.index - b.data.index);
  const n = arr.length;

  let level = 0;

  await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
  if (executionId !== executionIdRef.current) return;

  for (let size = 1; size < n; size *= 2) {
    level++;

    for (let left = 0; left < n; left += size * 2) {

      if (executionId !== executionIdRef.current) return;

      const mid = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + size * 2 - 1, n - 1);
      const blockIndex = Math.floor(left / (size * 2));

      let temp: typeof arr = [];
      let i = left;
      let j = mid + 1;

      // COMPARE PHASE
      while (i <= mid && j <= right) {

        if (executionId !== executionIdRef.current) return;

        const leftNode = arr[i];
        const rightNode = arr[j];

        setNodes(prev =>
          prev.map(node =>
            node.id === leftNode.id || node.id === rightNode.id
              ? { ...node, data: { ...node.data, status: "compare" } }
              : node
          )
        );

        await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
        if (executionId !== executionIdRef.current) return;

        if (leftNode.data.value <= rightNode.data.value) {
          temp.push(arr[i++]);
        } else {
          temp.push(arr[j++]);
        }

        setNodes(prev =>
          prev.map(node =>
            node.id === leftNode.id || node.id === rightNode.id
              ? { ...node, data: { ...node.data, status: "idle" } }
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

      // MERGE ANIMATION
      for (let k = 0; k < temp.length; k++) {

        if (executionId !== executionIdRef.current) return;

        const newIndex = left + k;
        const nodeToMove = temp[k];

        setNodes(prev =>
          prev.map(node =>
            node.id === nodeToMove.id
              ? {
                  ...node,
                  position: {
                    x: newIndex * NODE_WIDTH + blockIndex * BLOCK_GAP,
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

        await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
        if (executionId !== executionIdRef.current) return;
      }

      // RESET BLOCK
      setNodes(prev =>
        prev.map(node =>
          temp.some(t => t.id === node.id)
            ? { ...node, data: { ...node.data, status: "idle" } }
            : node
        )
      );

      await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;
    }
  }

  //  FINAL STATE
  setNodes(prev =>
    prev.map(node => ({
      ...node,
      position: positionFromIndex(node.data.index),
      data: { ...node.data, status: "sorted" },
    }))
  );
};