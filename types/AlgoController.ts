export type SpeedType = "1x" | "2x" | "5x";

export interface AlgoController {
  run?: () => void;
  stop?: () => void;

  nextStep?: () => void;
  prevStep?: () => void;

  skipForward?: () => void;
  skipBack?: () => void;

  isRunning?: boolean;

  // สำหรับ sync progress กับ CodeAlgo หรือ UI อื่น ๆ
  currentStep?: number;
  totalSteps?: number;

  setSpeed?: (speed: SpeedType) => void;
  speed?: SpeedType;
}