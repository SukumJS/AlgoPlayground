import { useState, useRef, useEffect } from "react";
import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { generateStepsByType } from "@/src/components/visualizer/algorithmsSort/generateSteps";
import { getExplanation } from "@/src/components/visualizer/explanations";
type Params = {
  algoType: string | null;
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  positionFromIndex: (index: number) => { x: number; y: number };
  delayRef: React.MutableRefObject<number>;
  /** optional callback used to update explanation text whenever step changes */
  setExplanation?: React.Dispatch<React.SetStateAction<string>>;
};

export function useStepSortEngine({
  algoType,
  nodes,
  setNodes,
  positionFromIndex,
  delayRef,
  setExplanation,
}: Params) {
  const [steps, setSteps] = useState<Node<SortNodeData>[][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const autoPlayRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const isInternalUpdateRef = useRef(false);

  // Sync nodes กับ step ปัจจุบัน
  useEffect(() => {
    if (steps.length === 0) return;

    const nextNodes = steps[currentStep];

    isInternalUpdateRef.current = true;

    setNodes((prev) =>
      prev.map((prevNode) => {
        const updated = nextNodes.find((n) => n.id === prevNode.id);
        if (!updated) return prevNode;

        return {
          ...prevNode,
          position: updated.position,
          data: { ...updated.data },
        };
      }),
    );
  }, [currentStep, steps, setNodes]);

  // ถ้า nodes เปลี่ยนจาก user (drag)
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    // user เปลี่ยนข้อมูล → reset steps
    setSteps([]);
    setCurrentStep(0);
  }, [nodes]);

  // Cleanup animation
  useEffect(() => {
    return () => {
      if (autoPlayRef.current !== null) {
        cancelAnimationFrame(autoPlayRef.current);
      }
    };
  }, []);

  // Generate Steps
  const generateSteps = () => {
    const generated = generateStepsByType(algoType, nodes, positionFromIndex);

    setSteps(generated);
    setCurrentStep(0);

    return generated;
  };

  // Manual Controls
  const nextStep = () => {
    let workingSteps = steps;

    if (workingSteps.length === 0) {
      workingSteps = generateSteps();
    }

    if (currentStep >= workingSteps.length - 1) return;
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (steps.length === 0) return;
    if (currentStep <= 0) return;
    setCurrentStep((prev) => prev - 1);
  };

  const skipForward = () => {
    let workingSteps = steps;

    if (workingSteps.length === 0) {
      workingSteps = generateSteps();
    }

    setCurrentStep(workingSteps.length - 1);
  };

  const skipBack = () => {
    let workingSteps = steps;

    if (workingSteps.length === 0) {
      workingSteps = generateSteps();
    }

    setCurrentStep(0);
  };

  // Run (Auto Play)
  const run = () => {
    const workingSteps = generateSteps();

    if (!workingSteps || workingSteps.length === 0) return;

    isRunningRef.current = true;
    setIsRunning(true);

    let lastTime = performance.now();

    const animate = (now: number) => {
      if (!isRunningRef.current) return;

      const delta = now - lastTime;

      if (delta >= delayRef.current) {
        setCurrentStep((prev) => {
          if (prev >= workingSteps.length - 1) {
            isRunningRef.current = false;
            setIsRunning(false);
            return prev;
          }
          return prev + 1;
        });

        lastTime = now;
      }

      autoPlayRef.current = requestAnimationFrame(animate);
    };

    autoPlayRef.current = requestAnimationFrame(animate);
  };

  const stop = () => {
    isRunningRef.current = false;

    if (autoPlayRef.current !== null) {
      cancelAnimationFrame(autoPlayRef.current);
    }

    setIsRunning(false);
  };

  // whenever the step changes we can optionally generate a human readable description
  useEffect(() => {
    if (!setExplanation || steps.length === 0) return;

    // delegate to the generic explanation dispatcher; the first argument is
    // the algorithm category ("sort" in this hook).  this keeps the hook
    // generic and makes it easier to reuse the dispatcher elsewhere.
    const explanation = getExplanation("sort", algoType, currentStep, steps);
    if (explanation !== undefined) {
      setExplanation(explanation);
    }
    // setExplanation itself never changes so we don't need to include it as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, steps, algoType]);

  return {
    run,
    stop,
    nextStep,
    prevStep,
    skipBack,
    skipForward,
    isRunning,
    currentStep,
    totalSteps: steps.length,
  };
}
