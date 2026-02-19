import { useState, useRef } from "react";
import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { sortAlgorithms } from "@/src/components/visualizer/algorithmsSort";

export function useSortRunner(
  nodes: Node<SortNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>,
  algoType: string | null,
  positionFromIndex: (index: number) => { x: number; y: number },
  delayRef: React.MutableRefObject<number>
) {
  const [isSorting, setIsSorting] = useState(false);
  const isRunningRef = useRef(false);

  const handleRunSort = async () => {
    if (isRunningRef.current) return;

    const runner =
      sortAlgorithms[algoType as keyof typeof sortAlgorithms];

    if (!runner) return;

    isRunningRef.current = true;
    setIsSorting(true);

    const snapped = nodes
      .map((node) => ({
        ...node,
        position: positionFromIndex(node.data.index),
      }))
      .sort((a, b) => a.data.index - b.data.index);

    setNodes(snapped);

    await runner({
      nodes: snapped,
      setNodes,
      positionFromIndex,
      delayRef,
      isRunningRef,
    });

    isRunningRef.current = false;
    setIsSorting(false);
  };

  const handleStop = () => {
    isRunningRef.current = false;
  };

  return { handleRunSort, handleStop, isSorting };
}
