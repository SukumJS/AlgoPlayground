export type SpeedType = "1x" | "2x" | "5x";

export interface AlgoController {
  run?: () => void;
  stop?: () => void;

  nextStep?: () => void;
  prevStep?: () => void;

  skipForward?: () => void;
  skipBack?: () => void;

  isRunning?: boolean;

  // expose current step index so parent can react or generate explanation
  currentStep?: number;

  /** optional mapping from step index -> code line number (1-based) */
  stepToCodeLine?: number[];

  setSpeed?: (speed: SpeedType) => void;
  speed?: SpeedType;
}
