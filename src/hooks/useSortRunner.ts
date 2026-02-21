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
  const isPausedRef = useRef(false);
  const hasUserModifiedRef = useRef(false);

  const executionIdRef = useRef(0);
  const isRunning = isRunningRef.current;

  const markUserModified = () => {
    hasUserModifiedRef.current = true;
  };
  const handleRunSort = async () => {
    // ถ้ากำลังรันอยู่ ไม่ต้องทำอะไร
    if (isRunningRef.current) return;

    // ถ้า pause อยู่ และ user ไม่ได้แก้ไข → resume
    if (isPausedRef.current && !hasUserModifiedRef.current) {
      isPausedRef.current = false;
      isRunningRef.current = true;
      setIsSorting(true);
      return;
    }

    const runner =
      sortAlgorithms[algoType as keyof typeof sortAlgorithms];

    if (!runner) return;
    executionIdRef.current += 1;
    const currentExecutionId = executionIdRef.current;


    isPausedRef.current = false;
    isRunningRef.current = true;
    setIsSorting(true);

    const snapped = nodes
      .map((node) => ({
        ...node,
        position: positionFromIndex(node.data.index),
      }))
      .sort((a, b) => a.data.index - b.data.index);

    // reset status ทุกตัวก่อน run ใหม่
    const resetNodes: Node<SortNodeData>[] = snapped.map(node => ({
      ...node,
      data: {
        ...node.data,
        status: "idle" as const,
      }
    }));

    setNodes(resetNodes);

    await runner({
      nodes: resetNodes,
      setNodes,
      positionFromIndex,
      delayRef,
      isRunningRef,
      executionId: currentExecutionId,
      executionIdRef,
    });

    hasUserModifiedRef.current = false;
    isRunningRef.current = false;
    isPausedRef.current = false;
    setIsSorting(false);
  };

  const handleStop = () => {
    isPausedRef.current = true;
    isRunningRef.current = false;
    setIsSorting(false);
  };

  return { handleRunSort, handleStop, isSorting, markUserModified , isRunning};
}
