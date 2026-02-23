import { AlgoController } from "@/types/AlgoController";
import { useStepSortEngine } from "@/src/hooks/sort/useStepSortEngine";

type Params = {
  algoType: string | null; // เอาไว้รับค่าเช่น 'bubble', 'insertion'
  nodes: any;
  setNodes: any;
  positionFromIndex: any;
  delayRef: any;
  setSpeed: any;
  speed: any;
};

export function useSortController({
  algoType,
  nodes,
  setNodes,
  positionFromIndex,
  delayRef,
  setSpeed,
  speed,
}: Params): AlgoController {

  // เรียกใช้ Engine ของ Sort 
  const engine = useStepSortEngine({
    algoType,
    nodes,
    setNodes,
    positionFromIndex,
    delayRef,
  });

  return {
    ...engine,
    setSpeed,
    speed,
  };
}