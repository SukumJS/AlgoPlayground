// import { useGraphEngine } from "@/src/hooks/useGraphEngine";
// import { useTreeEngine } from "@/src/hooks/useTreeEngine";
import { AlgoController } from "@/types/AlgoController";
import { useStepSortEngine } from "@/src/hooks/sort/useStepSortEngine";

type Params = {
  algoType: string | null;
  nodes: any;
  setNodes: any;
  positionFromIndex: any;
  delayRef: any;
  setSpeed: any;
  speed: any;
};

export function useAlgoController({
  algoType,
  nodes,
  setNodes,
  positionFromIndex,
  delayRef,
  setSpeed,
  speed,
}: Params): AlgoController {

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