import type { Node } from "@xyflow/react";
import type { SortNodeData } from "../../shared/sortNode";
import { swapByIndex } from "./swap";

type InsertionSortParams = {
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  positionFromIndex: (index: number) => { x: number; y: number };
  delayRef: React.MutableRefObject<number>;
  isRunningRef: React.MutableRefObject<boolean>;
  executionId: number;
  executionIdRef: React.MutableRefObject<number>;
};

// sleep รองรับ pause + execution guard
const sleepWithPause = (
  delay: number,
  isRunningRef: React.MutableRefObject<boolean>,
  executionId: number,
  executionIdRef: React.MutableRefObject<number>
) => {
  return new Promise<void>((resolve) => {
    const start = Date.now();

    const check = () => {
      // ถ้ามี execution ใหม่ → kill ทันที
      if (executionId !== executionIdRef.current) {
        resolve();
        return;
      }

      // ถ้า pause → รอ
      if (!isRunningRef.current) {
        setTimeout(check, 10);
        return;
      }

      // ครบเวลา → ไปต่อ
      if (Date.now() - start >= delay) {
        resolve();
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
};

const getByIndex = (
  nodes: Node<SortNodeData>[],
  index: number
) => nodes.find((n) => n.data.index === index)!;

export async function runInsertionSort({
  nodes,
  setNodes,
  positionFromIndex,
  delayRef,
  isRunningRef,
  executionId,
  executionIdRef,
}: InsertionSortParams) {

  let current = [...nodes].sort((a, b) => a.data.index - b.data.index);
  const n = current.length;

  const speed = delayRef.current;
  const LIFT_Y = 40;
  const LIFT_TIME = speed * 0.6;
  const MOVE_TIME = speed * 0.8;
  const DROP_TIME = speed * 0.6;
  const MICRO_PAUSE = speed * 0.3;

  for (let i = 1; i < n; i++) {
    if (executionId !== executionIdRef.current) return;

    let j = i;

    while (
      j > 0 &&
      getByIndex(current, j - 1).data.value >
        getByIndex(current, j).data.value
    ) {
      if (executionId !== executionIdRef.current) return;

      const left = getByIndex(current, j - 1);
      const right = getByIndex(current, j);

      //  Compare
      setNodes((prev) =>
        prev.map((node) =>
          node.id === left.id || node.id === right.id
            ? { ...node, data: { ...node.data, status: "compare" } }
            : node
        )
      );

      await sleepWithPause(speed, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;

      //  Lift
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === left.id) {
            return {
              ...node,
              data: { ...node.data, status: "swap" },
              position: {
                ...node.position,
                y: node.position.y - LIFT_Y,
              },
            };
          }
          if (node.id === right.id) {
            return {
              ...node,
              data: { ...node.data, status: "swap" },
              position: {
                ...node.position,
                y: node.position.y + LIFT_Y,
              },
            };
          }
          return node;
        })
      );

      await sleepWithPause(LIFT_TIME, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;

      // Horizontal move
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === left.id) {
            return {
              ...node,
              position: {
                x: positionFromIndex(j).x,
                y: node.position.y,
              },
            };
          }
          if (node.id === right.id) {
            return {
              ...node,
              position: {
                x: positionFromIndex(j - 1).x,
                y: node.position.y,
              },
            };
          }
          return node;
        })
      );

      await sleepWithPause(MOVE_TIME, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;

      // Drop
      setNodes((prev) =>
        prev.map((node) => {
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
        })
      );

      await sleepWithPause(DROP_TIME, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;

      // Commit index (สำคัญ)
      current = swapByIndex(current, j - 1, j, positionFromIndex);

      setNodes((prev) =>
        prev.map((node) => {
          if (node.id === left.id) {
            return {
              ...node,
              data: { ...node.data, index: j },
            };
          }
          if (node.id === right.id) {
            return {
              ...node,
              data: { ...node.data, index: j - 1 },
            };
          }
          return node;
        })
      );

      await sleepWithPause(
        MICRO_PAUSE,
        isRunningRef,
        executionId,
        executionIdRef
      );
      if (executionId !== executionIdRef.current) return;

      // Reset status
      setNodes((prev) =>
        prev.map((node) =>
          node.id === left.id || node.id === right.id
            ? { ...node, data: { ...node.data, status: "idle" } }
            : node
        )
      );

      j--;
    }
  }

  //  Mark sorted
  setNodes((prev) =>
    prev.map((node) => ({
      ...node,
      data: { ...node.data, status: "sorted" },
    }))
  );
}