import type { Node } from "@xyflow/react";
import type { SortNodeData } from "../../shared/sortNode";
import { swapByIndex } from "./swap";

type SelectionSortParams = {
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

const getByIndex = (
  nodes: Node<SortNodeData>[],
  index: number
) => nodes.find((n) => n.data.index === index)!;

export async function runSelectionSort({
  nodes,
  setNodes,
  positionFromIndex,
  delayRef,
  isRunningRef,
  executionId,
  executionIdRef,
}: SelectionSortParams) {

  let current = [...nodes].sort((a, b) => a.data.index - b.data.index);
  const n = current.length;
  const LIFT_Y = 40;

  for (let i = 0; i < n; i++) {

    if (executionId !== executionIdRef.current) return;

    let minIndex = i;

    // 🔹 ① หา minimum
    for (let j = i + 1; j < n; j++) {

      if (executionId !== executionIdRef.current) return;

      const nodeJ = getByIndex(current, j);
      const nodeMin = getByIndex(current, minIndex);

      setNodes(prev =>
        prev.map(node =>
          node.id === nodeJ.id || node.id === nodeMin.id
            ? { ...node, data: { ...node.data, status: "compare" } }
            : node
        )
      );

      await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;

      if (nodeJ.data.value < nodeMin.data.value) {
        minIndex = j;
      }

      setNodes(prev =>
        prev.map(node =>
          node.id === nodeJ.id || node.id === nodeMin.id
            ? { ...node, data: { ...node.data, status: "idle" } }
            : node
        )
      );
    }

    // 🔹 ② ถ้าต้อง swap
    if (minIndex !== i) {

      const nodeI = getByIndex(current, i);
      const nodeMin = getByIndex(current, minIndex);

      // lift
      setNodes(prev =>
        prev.map(node => {
          if (node.id === nodeI.id) {
            return {
              ...node,
              data: { ...node.data, status: "swap" },
              position: { ...node.position, y: node.position.y - LIFT_Y },
            };
          }
          if (node.id === nodeMin.id) {
            return {
              ...node,
              data: { ...node.data, status: "swap" },
              position: { ...node.position, y: node.position.y + LIFT_Y },
            };
          }
          return node;
        })
      );

      await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;

      // horizontal move
      setNodes(prev =>
        prev.map(node => {
          if (node.id === nodeI.id) {
            return {
              ...node,
              position: {
                x: positionFromIndex(minIndex).x,
                y: node.position.y,
              },
            };
          }
          if (node.id === nodeMin.id) {
            return {
              ...node,
              position: {
                x: positionFromIndex(i).x,
                y: node.position.y,
              },
            };
          }
          return node;
        })
      );

      await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;

      // drop
      setNodes(prev =>
        prev.map(node => {
          if (node.id === nodeI.id) {
            return { ...node, position: positionFromIndex(minIndex) };
          }
          if (node.id === nodeMin.id) {
            return { ...node, position: positionFromIndex(i) };
          }
          return node;
        })
      );

      await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;

      // commit index
      current = swapByIndex(current, i, minIndex, positionFromIndex);
      setNodes(current);

      await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
      if (executionId !== executionIdRef.current) return;
    }

    // 🔹 ③ mark sorted
    current = current.map(node =>
      node.data.index === i
        ? { ...node, data: { ...node.data, status: "sorted" } }
        : node
    );

    setNodes(current);

    await sleepWithPause(delayRef.current, isRunningRef, executionId, executionIdRef);
    if (executionId !== executionIdRef.current) return;
  }
}