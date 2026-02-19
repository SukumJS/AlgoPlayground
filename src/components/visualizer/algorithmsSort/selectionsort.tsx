import type { Node } from "@xyflow/react";
import type { SortNodeData } from "../../shared/sortNode";
import { swapByIndex } from "./swap";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
}: {
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  positionFromIndex: (index: number) => { x: number; y: number };
  delayRef: React.MutableRefObject<number>;
  isRunningRef: React.MutableRefObject<boolean>;
}) {
  let current = [...nodes];
  const n = current.length;
  const LIFT_Y = 40;

  for (let i = 0; i < n; i++) {
    if (!isRunningRef.current) return;

    let minIndex = i;

    // ① หาค่าน้อยสุด
    for (let j = i + 1; j < n; j++) {
      if (!isRunningRef.current) return;

      setNodes((prev) =>
        prev.map((node) =>
          node.data.index === j || node.data.index === minIndex
            ? { ...node, data: { ...node.data, status: "compare" } }
            : node
        )
      );

      await sleep(delayRef.current);

      if (
        getByIndex(current, j).data.value <
        getByIndex(current, minIndex).data.value
      ) {
        minIndex = j;
      }

      // reset compare
      setNodes((prev) =>
        prev.map((node) =>
          node.data.status === "compare"
            ? { ...node, data: { ...node.data, status: "idle" } }
            : node
        )
      );
    }

    // ② ถ้าต้องสลับ
    if (minIndex !== i) {
      // ยก i และ minIndex
      setNodes((prev) =>
        prev.map((node) => {
          if (node.data.index === i) {
            return {
              ...node,
              data: { ...node.data, status: "swap" },
              position: {
                ...node.position,
                y: node.position.y - LIFT_Y,
              },
            };
          }
          if (node.data.index === minIndex) {
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

      await sleep(delayRef.current);

      // เลื่อนแนวนอน
      setNodes((prev) =>
        prev.map((node) => {
          if (node.data.index === i) {
            return {
              ...node,
              position: {
                x: positionFromIndex(minIndex).x,
                y: node.position.y,
              },
            };
          }
          if (node.data.index === minIndex) {
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

      await sleep(delayRef.current);

      // กลับลงแถว
      setNodes((prev) =>
        prev.map((node) => {
          if (node.data.index === i) {
            return {
              ...node,
              position: positionFromIndex(minIndex),
            };
          }
          if (node.data.index === minIndex) {
            return {
              ...node,
              position: positionFromIndex(i),
            };
          }
          return node;
        })
      );

      await sleep(delayRef.current);

      // commit index
      current = swapByIndex(current, i, minIndex, positionFromIndex);
      setNodes(current);

      await sleep(delayRef.current);
    }

    // ③ ตำแหน่ง i เรียงแล้ว
    current = current.map((node) =>
      node.data.index === i
        ? { ...node, data: { ...node.data, status: "sorted" } }
        : node
    );
    setNodes(current);

    await sleep(delayRef.current);
  }
}
