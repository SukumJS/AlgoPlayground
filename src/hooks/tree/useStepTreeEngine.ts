import { useState, useRef, useEffect, useCallback } from "react";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";

/**
 * Snapshot of a single animation step — stores everything needed
 * to render one frame of a tree animation (canvas + explanation + code).
 */
export interface TreeAnimationStep {
  nodes: RFNode[];
  edges: RFEdge[];
  description: string;
  codeStep: number;
  treeAction: string | null;
  stepToCodeLine: number[];
  isCleanStep?: boolean;
}

interface UseStepTreeEngineParams {
  setNodes: (nodes: RFNode[] | ((prev: RFNode[]) => RFNode[])) => void;
  setEdges: (edges: RFEdge[] | ((prev: RFEdge[]) => RFEdge[])) => void;
  setDescription: (desc: string) => void;
  setCodeStep: (step: number) => void;
  setTreeAction: (action: string | null) => void;
  setStepToCodeLine: (map: number[]) => void;
  setIsAnimating: (v: boolean) => void;
  delayRef: React.MutableRefObject<number>;
}

export function useStepTreeEngine({
  setNodes,
  setEdges,
  setDescription,
  setCodeStep,
  setTreeAction,
  setStepToCodeLine,
  setIsAnimating,
  delayRef,
}: UseStepTreeEngineParams) {
  const [steps, setSteps] = useState<TreeAnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isHoldingResult, setIsHoldingResult] = useState(false);

  const autoPlayRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const stepsRef = useRef<TreeAnimationStep[]>([]);

  // Keep stepsRef in sync
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // Apply a given step's snapshot to all UI panels
  const applyStep = useCallback(
    (step: TreeAnimationStep) => {
      setNodes(step.nodes);
      setEdges(step.edges);
      setDescription(step.description);
      setCodeStep(step.codeStep);
      setTreeAction(step.treeAction);
      setStepToCodeLine(step.stepToCodeLine);
    },
    [
      setNodes,
      setEdges,
      setDescription,
      setCodeStep,
      setTreeAction,
      setStepToCodeLine,
    ],
  );

  // Sync UI when currentStep changes
  useEffect(() => {
    if (steps.length === 0) {
      setIsAnimating(false);
      return;
    }
    if (currentStep < 0 || currentStep >= steps.length) return;
    applyStep(steps[currentStep]);

    // Check if we are holding at the result step (the step right before a clean step)
    const nextStep =
      currentStep + 1 < steps.length ? steps[currentStep + 1] : null;
    const holdingAtResult = nextStep?.isCleanStep === true;

    if (holdingAtResult) {
      // Pause here — show the result, unlock UI, but flag that we're holding
      setIsHoldingResult(true);
      setIsAnimating(false);
    } else if (currentStep === steps.length - 1) {
      // Lock UI when viewing animation history; unlock when at the final "present" step
      setIsAnimating(false);
      setIsHoldingResult(false);
    } else {
      setIsAnimating(true);
      setIsHoldingResult(false);
    }
  }, [currentStep, steps, applyStep, setIsAnimating]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current !== null) {
        cancelAnimationFrame(autoPlayRef.current);
      }
    };
  }, []);

  // Load new steps from a handler and optionally auto-run
  const loadSteps = useCallback(
    (newSteps: TreeAnimationStep[], autoRun = true) => {
      // Stop any current animation
      isRunningRef.current = false;
      if (autoPlayRef.current !== null) {
        cancelAnimationFrame(autoPlayRef.current);
        autoPlayRef.current = null;
      }

      setSteps(newSteps);
      stepsRef.current = newSteps;
      setCurrentStep(0);
      setIsAnimating(true);

      if (newSteps.length > 0) {
        applyStep(newSteps[0]);
      }

      if (autoRun && newSteps.length > 1) {
        // Start auto-play after a short delay to let React paint step 0
        setTimeout(() => {
          isRunningRef.current = true;
          setIsRunning(true);

          let lastTime = performance.now();
          let stepIdx = 0;

          const animate = (now: number) => {
            if (!isRunningRef.current) return;

            const delta = now - lastTime;
            if (delta >= delayRef.current) {
              stepIdx++;
              // Stop before a clean step — hold at the result
              if (
                stepIdx < stepsRef.current.length &&
                stepsRef.current[stepIdx].isCleanStep
              ) {
                isRunningRef.current = false;
                setIsRunning(false);
                setCurrentStep(stepIdx - 1);
                return;
              }
              if (stepIdx >= stepsRef.current.length) {
                // Reached the end
                isRunningRef.current = false;
                setIsRunning(false);
                setCurrentStep(stepsRef.current.length - 1);
                // Don't call setIsAnimating(false) — user may want to step back
                return;
              }
              setCurrentStep(stepIdx);
              lastTime = now;
            }

            autoPlayRef.current = requestAnimationFrame(animate);
          };

          autoPlayRef.current = requestAnimationFrame(animate);
        }, 50);
      }
    },
    [applyStep, delayRef, setIsAnimating],
  );

  // Run (resume or start auto-play from current position)
  const run = useCallback(() => {
    if (stepsRef.current.length === 0) return;

    isRunningRef.current = true;
    setIsRunning(true);

    let lastTime = performance.now();
    let stepIdx = currentStep;

    const animate = (now: number) => {
      if (!isRunningRef.current) return;

      const delta = now - lastTime;
      if (delta >= delayRef.current) {
        stepIdx++;
        // Stop before a clean step — hold at the result
        if (
          stepIdx < stepsRef.current.length &&
          stepsRef.current[stepIdx].isCleanStep
        ) {
          isRunningRef.current = false;
          setIsRunning(false);
          setCurrentStep(stepIdx - 1);
          return;
        }
        if (stepIdx >= stepsRef.current.length) {
          isRunningRef.current = false;
          setIsRunning(false);
          setCurrentStep(stepsRef.current.length - 1);
          return;
        }
        setCurrentStep(stepIdx);
        lastTime = now;
      }

      autoPlayRef.current = requestAnimationFrame(animate);
    };

    autoPlayRef.current = requestAnimationFrame(animate);
  }, [currentStep, delayRef]);

  // Stop (pause)
  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (autoPlayRef.current !== null) {
      cancelAnimationFrame(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Manual step navigation
  const nextStep = useCallback(() => {
    if (steps.length === 0) return;
    stop();
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length, stop]);

  const prevStep = useCallback(() => {
    if (steps.length === 0) return;
    stop();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, [steps.length, stop]);

  const skipForward = useCallback(() => {
    if (steps.length === 0) return;
    stop();
    setCurrentStep(steps.length - 1);
  }, [steps.length, stop]);

  const skipBack = useCallback(() => {
    if (steps.length === 0) return;
    stop();
    setCurrentStep(0);
  }, [steps.length, stop]);

  // Reset (clear steps entirely)
  const reset = useCallback(() => {
    stop();
    setSteps([]);
    setCurrentStep(0);
    setIsAnimating(false);
    setIsHoldingResult(false);
  }, [stop, setIsAnimating]);

  // Dismiss the held result — advance to the clean step (resets the tree to normal)
  const dismissResult = useCallback(() => {
    if (!isHoldingResult) return;
    // The clean step is the step right after the current one
    const cleanIdx = currentStep + 1;
    if (cleanIdx < steps.length && steps[cleanIdx].isCleanStep) {
      setCurrentStep(cleanIdx);
    }
    setIsHoldingResult(false);
  }, [isHoldingResult, currentStep, steps]);

  return {
    loadSteps,
    run,
    stop,
    nextStep,
    prevStep,
    skipForward,
    skipBack,
    reset,
    dismissResult,
    isRunning,
    isHoldingResult,
    currentStep,
    totalSteps: steps.length,
  };
}
