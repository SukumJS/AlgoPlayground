import { useState, useCallback, useRef, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import type {
  AnimationStep,
  AlgorithmRunner,
  EdgeAnimationState,
} from "../types/algorithm";

const EDGE_STROKE: Record<EdgeAnimationState, string> = {
  default: "#222121",
  traversing: "#F7AD45",
  traversed: "#F7AD45",
};

// ── Speed multipliers (ms per step) ──────────────────────────────
const SPEED_MS: Record<string, number> = {
  "1x": 1000,
  "2x": 500,
  "5x": 200,
};

// ── Hook ─────────────────────────────────────────────────────────
export interface UseAlgorithmAnimationReturn {
  /** Current step index (-1 = not started) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether the animation is currently auto-playing */
  isPlaying: boolean;
  /** Description of the current step */
  description: string;
  /** Start the algorithm with given start/end labels */
  start: (startLabel: string, endLabel: string) => void;
  /** Reset animation back to initial state */
  reset: () => void;
  /** Toggle play / pause */
  play: () => void;
  pause: () => void;
  /** Manual step controls */
  nextStep: () => void;
  prevStep: () => void;
  /** Jump to first / last step */
  skipToStart: () => void;
  skipToEnd: () => void;
  /** Set playback speed ("1x" | "2x" | "5x") */
  setSpeed: (speed: string) => void;
  /** Current speed label */
  speed: string;
}

export function useAlgorithmAnimation(
  runner: AlgorithmRunner | undefined,
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
): UseAlgorithmAnimationReturn {
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState("1x");

  // Keep refs for timer-based access
  const stepsRef = useRef(steps);
  const currentStepRef = useRef(currentStep);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store the original (pre-animation) nodes & edges so we can restore them
  const originalNodesRef = useRef<Node[]>([]);
  const originalEdgesRef = useRef<Edge[]>([]);

  useEffect(() => { stepsRef.current = steps; }, [steps]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // ── Apply a specific step to the ReactFlow nodes/edges ─────────
  const applyStep = useCallback(
    (stepIdx: number) => {
      const step = stepsRef.current[stepIdx];
      if (!step) return;

      setNodes((prev) =>
        prev.map((node) => {
          const state = step.nodeStates[node.id] ?? "default";
          return {
            ...node,
            data: {
              ...node.data,
              animationState: state,
            },
            style: {
              ...node.style,
              // Override background/border/text via inline styles for quick visual
            },
          };
        }),
      );

      setEdges((prev) =>
        prev.map((edge) => {
          const state = step.edgeStates[edge.id] ?? "default";
          return {
            ...edge,
            data: {
              ...edge.data,
              animationState: state,
            },
            style: {
              ...edge.style,
              stroke: EDGE_STROKE[state],
              strokeWidth: state !== "default" ? 2.5 : 1,
            },
          };
        }),
      );
    },
    [setNodes, setEdges],
  );

  // ── Restore original appearance ────────────────────────────────
  const restoreOriginal = useCallback(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: { ...node.data, animationState: undefined },
      })),
    );
    setEdges((prev) =>
      prev.map((edge) => ({
        ...edge,
        data: { ...edge.data, animationState: undefined },
        style: { ...edge.style, stroke: "#222121", strokeWidth: 1 },
      })),
    );
  }, [setNodes, setEdges]);

  // ── Auto-play timer ────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNextRef = useRef<() => void>(() => {});

  const scheduleNext = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (!isPlayingRef.current) return;
      const next = currentStepRef.current + 1;
      if (next >= stepsRef.current.length) {
        setIsPlaying(false);
        return;
      }
      setCurrentStep(next);
      applyStep(next);
      scheduleNextRef.current();
    }, SPEED_MS[speedRef.current] ?? 1000);
  }, [clearTimer, applyStep]);

  useEffect(() => { scheduleNextRef.current = scheduleNext; }, [scheduleNext]);

  // ── Public API ─────────────────────────────────────────────────
  const start = useCallback(
    (startLabel: string, endLabel: string) => {
      if (!runner) return;
      clearTimer();
      setIsPlaying(false);

      // Snapshot originals
      originalNodesRef.current = nodes;
      originalEdgesRef.current = edges;

      const generated = runner.generateSteps(nodes, edges, startLabel, endLabel);
      setSteps(generated);
      stepsRef.current = generated;

      if (generated.length > 0) {
        setCurrentStep(0);
        currentStepRef.current = 0;
        // Apply first step immediately
        // Need to use a micro-delay so state has updated
        setTimeout(() => {
          const step = generated[0];
          if (!step) return;
          setNodes((prev) =>
            prev.map((node) => ({
              ...node,
              data: { ...node.data, animationState: step.nodeStates[node.id] ?? "default" },
            })),
          );
          setEdges((prev) =>
            prev.map((edge) => ({
              ...edge,
              data: { ...edge.data, animationState: step.edgeStates[edge.id] ?? "default" },
              style: {
                ...edge.style,
                stroke: EDGE_STROKE[step.edgeStates[edge.id] ?? "default"],
                strokeWidth: (step.edgeStates[edge.id] ?? "default") !== "default" ? 2.5 : 1,
              },
            })),
          );

          // Auto-play from step 0 immediately after applying the first step
          if (generated.length > 1) {
            setIsPlaying(true);
            isPlayingRef.current = true;
            scheduleNextRef.current();
          }
        }, 0);
      }
    },
    [runner, nodes, edges, setNodes, setEdges, clearTimer],
  );

  const reset = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
    setCurrentStep(-1);
    setSteps([]);
    restoreOriginal();
  }, [clearTimer, restoreOriginal]);

  const play = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    // If at the end, restart
    if (currentStepRef.current >= stepsRef.current.length - 1) {
      setCurrentStep(0);
      currentStepRef.current = 0;
      applyStep(0);
    }
    setIsPlaying(true);
    isPlayingRef.current = true;
    scheduleNext();
  }, [applyStep, scheduleNext]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPlaying(false);
  }, [clearTimer]);

  const nextStep = useCallback(() => {
    const next = currentStepRef.current + 1;
    if (next >= stepsRef.current.length) return;
    setCurrentStep(next);
    applyStep(next);
  }, [applyStep]);

  const prevStep = useCallback(() => {
    const prev = currentStepRef.current - 1;
    if (prev < 0) return;
    setCurrentStep(prev);
    applyStep(prev);
  }, [applyStep]);

  const skipToStart = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    setCurrentStep(0);
    applyStep(0);
  }, [applyStep]);

  const skipToEnd = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    const last = stepsRef.current.length - 1;
    setCurrentStep(last);
    applyStep(last);
  }, [applyStep]);

  const description = currentStep >= 0 && currentStep < steps.length ? steps[currentStep].description : "";

  return {
    currentStep,
    totalSteps: steps.length,
    isPlaying,
    description,
    start,
    reset,
    play,
    pause,
    nextStep,
    prevStep,
    skipToStart,
    skipToEnd,
    setSpeed,
    speed,
  };
}
