import { useState, useCallback, useRef, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import type {
  AnimationStep,
  AlgorithmRunner,
  EdgeAnimationState,
} from "@/src/components/visualizer/types/algorithm";

const EDGE_STROKE: Record<EdgeAnimationState, string> = {
  default: "#222121",
  traversing: "#F7AD45",
  traversed: "#F7AD45",
};

// ── Speed multipliers (ms per step) ──────────────────────────────
const SPEED_MS: Record<string, number> = {
  "1x": 1400,
  "2x": 700,
  "5x": 300,
};

// ── Hook ─────────────────────────────────────────────────────────
export interface UseAlgorithmAnimationReturn {
  /** Current step index (-1 = not started) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Optional mapping from step index -> code line number (1-based) */
  stepToCodeLine?: number[];
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
  const autoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store the original (pre-animation) nodes & edges so we can restore them
  const originalNodesRef = useRef<Node[]>([]);
  const originalEdgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

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
  const clearAutoResetTimer = useCallback(() => {
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }
  }, []);

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
        isPlayingRef.current = false;
        // Restore original node/edge appearance after a short delay
        // so the user can see the final result, but keep steps intact
        // for ControlPanel navigation (Prev Step, Skip Back, etc.).
        clearAutoResetTimer();
        autoResetTimerRef.current = setTimeout(() => {
          restoreOriginal();
        }, 2000);
        return;
      }
      setCurrentStep(next);
      applyStep(next);
      scheduleNextRef.current();
    }, SPEED_MS[speedRef.current] ?? 1000);
  }, [clearTimer, applyStep, clearAutoResetTimer, restoreOriginal]);

  useEffect(() => {
    scheduleNextRef.current = scheduleNext;
  }, [scheduleNext]);

  // ── Public API ─────────────────────────────────────────────────
  const start = useCallback(
    (startLabel: string, endLabel: string) => {
      if (!runner) return;
      clearTimer();
      clearAutoResetTimer();
      setIsPlaying(false);

      // Snapshot originals
      originalNodesRef.current = nodes;
      originalEdgesRef.current = edges;

      const generated = runner.generateSteps(
        nodes,
        edges,
        startLabel,
        endLabel,
      );
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
              data: {
                ...node.data,
                animationState: step.nodeStates[node.id] ?? "default",
              },
            })),
          );
          setEdges((prev) =>
            prev.map((edge) => ({
              ...edge,
              data: {
                ...edge.data,
                animationState: step.edgeStates[edge.id] ?? "default",
              },
              style: {
                ...edge.style,
                stroke: EDGE_STROKE[step.edgeStates[edge.id] ?? "default"],
                strokeWidth:
                  (step.edgeStates[edge.id] ?? "default") !== "default"
                    ? 2.5
                    : 1,
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
    [runner, nodes, edges, setNodes, setEdges, clearTimer, clearAutoResetTimer],
  );

  const reset = useCallback(() => {
    clearTimer();
    clearAutoResetTimer();
    setIsPlaying(false);
    setCurrentStep(-1);
    setSteps([]);
    restoreOriginal();
  }, [clearTimer, clearAutoResetTimer, restoreOriginal]);

  const play = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    // Cancel any pending auto-reset when user resumes playback
    clearAutoResetTimer();
    // If at the end, restart
    if (currentStepRef.current >= stepsRef.current.length - 1) {
      setCurrentStep(0);
      currentStepRef.current = 0;
      applyStep(0);
    }
    setIsPlaying(true);
    isPlayingRef.current = true;
    scheduleNext();
  }, [applyStep, scheduleNext, clearAutoResetTimer]);

  const pause = useCallback(() => {
    clearTimer();
    clearAutoResetTimer();
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [clearTimer, clearAutoResetTimer]);

  const nextStep = useCallback(() => {
    clearAutoResetTimer();
    const next = currentStepRef.current + 1;
    if (next >= stepsRef.current.length) return;
    setCurrentStep(next);
    applyStep(next);
  }, [applyStep, clearAutoResetTimer]);

  const prevStep = useCallback(() => {
    clearAutoResetTimer();
    const prev = currentStepRef.current - 1;
    if (prev < 0) return;
    setCurrentStep(prev);
    applyStep(prev);
  }, [applyStep, clearAutoResetTimer]);

  const skipToStart = useCallback(() => {
    clearAutoResetTimer();
    if (stepsRef.current.length === 0) return;
    setCurrentStep(0);
    applyStep(0);
  }, [applyStep, clearAutoResetTimer]);

  const skipToEnd = useCallback(() => {
    clearAutoResetTimer();
    if (stepsRef.current.length === 0) return;
    const last = stepsRef.current.length - 1;
    setCurrentStep(last);
    applyStep(last);
  }, [applyStep, clearAutoResetTimer]);

  const description =
    currentStep >= 0 && currentStep < steps.length
      ? steps[currentStep].description
      : "";

  const stepToCodeLineRaw = steps.map((s) => s.codeLine ?? 0);
  const stepToCodeLine = steps.some((s) => typeof s.codeLine === "number")
    ? stepToCodeLineRaw
    : undefined;

  return {
    currentStep,
    totalSteps: steps.length,
    stepToCodeLine,
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
