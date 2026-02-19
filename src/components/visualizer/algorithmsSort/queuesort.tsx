import type { Node } from "@xyflow/react";
import type { SortNodeData } from "../../shared/sortNode";
import { swapByIndex } from "./swap";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runQueueSort({
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
  let arr = [...nodes];

  const max = Math.max(...arr.map((n) => n.data.value));
  let exp = 1;

  while (Math.floor(max / exp) > 0) {
    if (!isRunningRef.current) return;

    const buckets: Node<SortNodeData>[][] = Array.from(
      { length: 10 },
      () => []
    );

    // 🔹 Distribute
    for (const node of arr) {
      if (!isRunningRef.current) return;

      const digit = Math.floor(node.data.value / exp) % 10;
      buckets[digit].push(node);

      setNodes((prev) =>
        prev.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, status: "compare" } }
            : n
        )
      );

      await sleep(delayRef.current);
    }

    // 🔹 Collect
    arr = [];
    let index = 0;

    for (let d = 0; d < 10; d++) {
      for (const node of buckets[d]) {
        if (!isRunningRef.current) return;

        arr.push({
          ...node,
          data: { ...node.data, index },
          position: positionFromIndex(index),
        });

        index++;

        setNodes([...arr]);
        await sleep(delayRef.current);
      }
    }

    // reset status
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle" },
      }))
    );

    exp *= 10;
  }

  // mark sorted
  setNodes((prev) =>
    prev.map((n) => ({
      ...n,
      data: { ...n.data, status: "sorted" },
    }))
  );
}
