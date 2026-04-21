import { useCallback } from "react";
import { AlgoController } from "@/types/AlgoController";

/**
 * Interface for the step-based tree animation engine.
 * useStepTreeEngine returns an object matching this shape.
 */
export interface TreeAnimationEngine {
  run: () => void;
  stop: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipForward: () => void;
  skipBack: () => void;
  reset: () => void;
  dismissResult: () => void;
  isRunning: boolean;
  isHoldingResult: boolean;
}

export function useTreeController(
  engine: TreeAnimationEngine | null,
  speed: "1x" | "2x" | "5x",
  setSpeed: (s: "1x" | "2x" | "5x") => void,
): AlgoController {
  const run = useCallback(() => {
    engine?.run();
  }, [engine]);

  const stop = useCallback(() => {
    engine?.stop();
  }, [engine]);

  const nextStep = useCallback(() => {
    engine?.nextStep();
  }, [engine]);

  const prevStep = useCallback(() => {
    engine?.prevStep();
  }, [engine]);

  const skipForward = useCallback(() => {
    engine?.skipForward();
  }, [engine]);

  const skipBack = useCallback(() => {
    engine?.skipBack();
  }, [engine]);

  return {
    run,
    stop,
    nextStep,
    prevStep,
    skipForward,
    skipBack,
    speed,
    setSpeed,
    isRunning: engine?.isRunning ?? false,
  };
}
