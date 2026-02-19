import type { Node } from "@xyflow/react";
import type { SortNodeData } from "../../shared/sortNode";
import { swapByIndex } from "./swap";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
}: {
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  positionFromIndex: (index: number) => { x: number; y: number };
  delayRef: React.MutableRefObject<number>;
  isRunningRef: React.MutableRefObject<boolean>;
}) {
  let current = [...nodes].sort((a, b) => a.data.index - b.data.index);
  const n = current.length;

  const speed = delayRef.current;
  const LIFT_Y = 40;
  const LIFT_TIME = speed * 0.6;
  const MOVE_TIME = speed * 0.8;
  const DROP_TIME = speed * 0.6;
  const MICRO_PAUSE = speed * 0.3;

  for (let i = 1; i < n; i++) {
    if (!isRunningRef.current) return;

    let j = i;

    while (
      j > 0 &&
      getByIndex(current, j - 1).data.value >
        getByIndex(current, j).data.value
    ) {
      if (!isRunningRef.current) return;

      const left = getByIndex(current, j - 1);
      const right = getByIndex(current, j);

      //  compare
      setNodes((prev) =>
        prev.map((node) =>
          node.id === left.id || node.id === right.id
            ? { ...node, data: { ...node.data, status: "compare" } }
            : node
        )
      );

      await sleep(speed);

      //  lift
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

      await sleep(LIFT_TIME);

      //  horizontal move
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

      await sleep(MOVE_TIME);

      //  drop back
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

      await sleep(DROP_TIME);

      // ④ commit index (สำคัญมาก)
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

      await sleep(MICRO_PAUSE);

      // reset status
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

  // mark sorted
  setNodes((prev) =>
    prev.map((node) => ({
      ...node,
      data: { ...node.data, status: "sorted" },
    }))
  );
}
