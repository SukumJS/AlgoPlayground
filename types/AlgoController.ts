export type SpeedType = "1x" | "2x" | "5x";

export interface AlgoController {
  run?: () => void;
  stop?: () => void;

  nextStep?: () => void;
  prevStep?: () => void;

  skipForward?: () => void;
  skipBack?: () => void;

  isRunning?: boolean;

<<<<<<< HEAD
  // สำหรับ sync progress กับ CodeAlgo หรือ UI อื่น ๆ
  currentStep?: number;
  totalSteps?: number;
=======
  // expose current step index so parent can react or generate explanation
  currentStep?: number;
>>>>>>> aefa6c22d7245fc04c616bb7629dfeaa543e60ce

  setSpeed?: (speed: SpeedType) => void;
  speed?: SpeedType;
}