import { useState, useCallback } from "react";
import { AlgoController } from "@/types/AlgoController";

// กำหนดโครงสร้างที่เพื่อนต้องส่งมาให้เรา
export interface TreeAnimationEngine {
  play: () => void;
  pause: () => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export function useTreeController(
  engine: TreeAnimationEngine | null,
): AlgoController {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState<"1x" | "2x" | "5x">("1x");

  const run = useCallback(() => {
    if (!engine) return;
    setIsRunning(true);
    engine.play();
  }, [engine]);

  const stop = useCallback(() => {
    if (!engine) return;
    setIsRunning(false);
    engine.pause();
  }, [engine]);

  const nextStep = useCallback(() => {
    if (!engine) return;
    stop();
    engine.nextStep();
  }, [engine, stop]);

  const prevStep = useCallback(() => {
    if (!engine) return;
    stop();
    engine.prevStep();
  }, [engine, stop]);

  const skipForward = useCallback(() => {
    if (!engine) return;
    stop();
    // ถ้าทำฟังก์ชันข้ามไปตอนจบ ค่อยมาใส่ตรงนี้
  }, [engine, stop]);

  const skipBack = useCallback(() => {
    if (!engine) return;
    stop();
    engine.reset();
  }, [engine, stop]);

  return {
    run,
    stop,
    nextStep,
    prevStep,
    skipForward,
    skipBack,
    speed,
    setSpeed,
    isRunning,
  };
}
