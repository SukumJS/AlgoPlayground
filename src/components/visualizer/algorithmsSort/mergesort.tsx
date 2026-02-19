import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";

type Params = {
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  delayRef: React.MutableRefObject<number>;
  isRunningRef: React.MutableRefObject<boolean>;
};

const GAP_Y = 120;
const NODE_GAP = 70;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function runMergeSort({
  nodes,
  setNodes,
  delayRef,
  isRunningRef,
}: Params) {
  if (!isRunningRef.current) return;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  let logical = nodes.map((n) => ({
    id: n.id,
    value: n.data.value,
  }));

  let bottomResult: typeof logical = [];

  for (let i = 0; i < logical.length; i += 2) {
    if (!isRunningRef.current) return;

    const pair = logical.slice(i, i + 2);

    // render แถวบน (ที่เหลือ)
    const topNodes: Node<SortNodeData>[] = logical.map((item, index) => {
      const original = nodeMap.get(item.id)!;
      return {
        id: `${item.id}-top-${Math.random()}`,
        type: original.type,
        position: {
          x: index * NODE_GAP,
          y: 0,
        },
        data: {
          ...original.data,
          value: item.value,
          status: "idle",
        },
      };
    });

    setNodes(topNodes);
    await sleep(delayRef.current);

    if (pair.length === 2) {
      if (pair[0].value > pair[1].value) {
        [pair[0], pair[1]] = [pair[1], pair[0]];
      }
    }

    bottomResult = [...bottomResult, ...pair];

    // render แถวล่าง (คู่ที่ทำเสร็จ)
    const bottomNodes: Node<SortNodeData>[] = bottomResult.map(
      (item, index) => {
        const original = nodeMap.get(item.id)!;
        return {
          id: `${item.id}-bottom-${Math.random()}`,
          type: original.type,
          position: {
            x: index * NODE_GAP,
            y: GAP_Y,
          },
          data: {
            ...original.data,
            value: item.value,
            status: "compare",
          },
        };
      }
    );

    setNodes([...topNodes, ...bottomNodes]);
    await sleep(delayRef.current);
  }

  // Final row
  const finalNodes: Node<SortNodeData>[] = bottomResult.map(
    (item, index) => {
      const original = nodeMap.get(item.id)!;
      return {
        id: `${item.id}-final-${Math.random()}`,
        type: original.type,
        position: {
          x: index * NODE_GAP,
          y: 0,
        },
        data: {
          ...original.data,
          value: item.value,
          status: "sorted",
        },
      };
    }
  );

  setNodes(finalNodes);
}
