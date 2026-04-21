import { useCallback } from "react";
import type { AlgoController, SpeedType } from "@/types/AlgoController";
import type { UseAlgorithmAnimationReturn } from "./graph/useAlgorithmAnimation";

/**
 * useGraphController
 * Wraps UseAlgorithmAnimationReturn → AlgoController
 * so that ControlPanel can drive graph algorithm playback.
 */
export function useGraphController(
  animation: UseAlgorithmAnimationReturn | null,
): AlgoController {
  const run = useCallback(() => {
    animation?.play();
  }, [animation]);

  const stop = useCallback(() => {
    animation?.pause();
  }, [animation]);

  const nextStep = useCallback(() => {
    animation?.pause();
    animation?.nextStep();
  }, [animation]);

  const prevStep = useCallback(() => {
    animation?.pause();
    animation?.prevStep();
  }, [animation]);

  const skipForward = useCallback(() => {
    animation?.pause();
    animation?.skipToEnd();
  }, [animation]);

  const skipBack = useCallback(() => {
    animation?.pause();
    animation?.skipToStart();
  }, [animation]);

  const setSpeed = useCallback(
    (speed: SpeedType) => {
      animation?.setSpeed(speed);
    },
    [animation],
  );

  return {
    run,
    stop,
    nextStep,
    prevStep,
    skipForward,
    skipBack,
    speed: (animation?.speed as SpeedType) ?? "1x",
    setSpeed,
    isRunning: animation?.isPlaying ?? false,
  };
}
