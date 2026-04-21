import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { AlgoController, SpeedType } from "@/types/AlgoController";
import { useStepSortEngine } from "@/src/hooks/sort/useStepSortEngine";

type Params = {
  algoType: string | null; // เอาไว้รับค่าเช่น 'bubble', 'insertion'
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  positionFromIndex: (index: number) => { x: number; y: number };
  delayRef: React.MutableRefObject<number>;
  setSpeed: (speed: SpeedType) => void;
  speed: SpeedType;
  // callback to update explanation text
  setExplanation?: React.Dispatch<React.SetStateAction<string>>;
};

export function useSortController({
  algoType,
  nodes,
  setNodes,
  positionFromIndex,
  delayRef,
  setSpeed,
  speed,
  setExplanation,
}: Params): AlgoController {
  // เรียกใช้ Engine ของ Sort
  const engine = useStepSortEngine({
    algoType,
    nodes,
    setNodes,
    positionFromIndex,
    delayRef,
    setExplanation,
  });

  return {
    ...engine,
    setSpeed,
    speed,
  };
}
