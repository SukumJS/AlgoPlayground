import { useState, useRef, useEffect } from "react";
import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { generateSearchStepsByType } from "@/src/components/visualizer/algorithmsSearch/generateSearchSteps";
import type { SearchStep } from "@/src/components/visualizer/algorithmsSearch/generateSearchSteps";

type Params = {
  algoType: string | null;
  nodes: Node<SortNodeData>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
  setExplanation?: React.Dispatch<React.SetStateAction<string>>;
  target: number;
  delayRef: React.MutableRefObject<number>;
};

const getSearchAlgorithmName = (algoType: string | null) => {
  if (algoType === "binary-search") return "Binary Search";
  if (algoType === "linear-search") return "Linear Search";
  return "Searching Algorithms";
};

const getDefaultSearchExplanation = (algoType: string | null) =>
  `This section will explain ${getSearchAlgorithmName(algoType)}. Click 'Run' to start.`;

const getNodesByNewStatus = (
  prevNodes: Node<SortNodeData>[],
  currNodes: Node<SortNodeData>[],
  status: SortNodeData["status"],
) => {
  const prevById = new Map(prevNodes.map((node) => [node.id, node]));
  return currNodes.filter((node) => {
    const prevNode = prevById.get(node.id);
    return node.data.status === status && prevNode?.data.status !== status;
  });
};

const buildStepExplanations = (
  algoType: string | null,
  steps: SearchStep[],
  target: number,
) => {
  if (steps.length === 0) return [];

  const algoName = getSearchAlgorithmName(algoType);

  return steps.map((step, index) => {
    const currentNodes = step.nodes;
    if (index === 0) {
      return `Starting ${algoName}. Target value is ${target}.`;
    }

    const prevNodes = steps[index - 1]?.nodes;
    const newCompared = getNodesByNewStatus(prevNodes, currentNodes, "compare");
    const newProcessing = getNodesByNewStatus(
      prevNodes,
      currentNodes,
      "processing",
    );
    const newDiscarded = getNodesByNewStatus(
      prevNodes,
      currentNodes,
      "discarded",
    );
    const newFound = getNodesByNewStatus(prevNodes, currentNodes, "found");

    if (newFound.length > 0) {
      const foundValue = Number(newFound[0].data.value);
      return `Found target ${target} at value ${foundValue}. Search completed.`;
    }

    if (newProcessing.length > 0) {
      const processingValue = Number(newProcessing[0].data.value);
      return `Processing value ${processingValue} to decide the next step.`;
    }

    if (newCompared.length > 0) {
      const comparedValue = Number(newCompared[0].data.value);
      return `Comparing target ${target} with value ${comparedValue}.`;
    }

    if (newDiscarded.length > 0) {
      if (algoType === "binary-search" && newDiscarded.length > 1) {
        return `Discarded ${newDiscarded.length} values that cannot contain target ${target}.`;
      }

      const discardedValue = Number(newDiscarded[0].data.value);
      return `Value ${discardedValue} does not match target ${target}. Move to the next value.`;
    }

    return `Continue ${algoName}.`;
  });
};

export function useStepSearchEngine({
  algoType,
  nodes,
  setNodes,
  setExplanation,
  target,
  delayRef,
}: Params) {
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [stepExplanations, setStepExplanations] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const autoPlayRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const isInternalUpdateRef = useRef(false);

  // Sync nodes กับ step ปัจจุบัน
  useEffect(() => {
    if (steps.length === 0) return;

    const nextNodes = steps[currentStep]?.nodes;
    if (!nextNodes) return;
    isInternalUpdateRef.current = true;

    setNodes((prev) =>
      prev.map((prevNode) => {
        const updated = nextNodes.find((n) => n.id === prevNode.id);
        if (!updated) return prevNode;

        return {
          ...prevNode,
          position: updated.position,
          data: { ...updated.data }, // อัปเดตข้อมูลสี status
        };
      }),
    );

    if (setExplanation) {
      setExplanation(
        stepExplanations[currentStep] ?? getDefaultSearchExplanation(algoType),
      );
    }
  }, [
    currentStep,
    steps,
    setNodes,
    setExplanation,
    stepExplanations,
    algoType,
  ]);

  const needsNewStepsRef = useRef(false);

  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    needsNewStepsRef.current = true;
  }, [nodes, target]);

  useEffect(() => {
    return () => {
      if (autoPlayRef.current !== null) {
        cancelAnimationFrame(autoPlayRef.current);
      }
    };
  }, []);

  const generateSteps = () => {
    const generated = generateSearchStepsByType(algoType, nodes, target);
    setSteps(generated);
    setStepExplanations(buildStepExplanations(algoType, generated, target));
    setCurrentStep(0);
    return generated;
  };

  // ฟังก์ชัน stop และ reset
  const stop = () => {
    isRunningRef.current = false;

    if (autoPlayRef.current !== null) {
      cancelAnimationFrame(autoPlayRef.current);
    }

    setIsRunning(false);
  };

  const reset = () => {
    stop(); // หยุดแอนิเมชัน
    setSteps([]);
    setStepExplanations([]);
    setCurrentStep(0);
    // เปลี่ยนสีกล่องทุกใบกลับเป็น idle
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle" },
      })),
    );

    if (setExplanation) {
      setExplanation(getDefaultSearchExplanation(algoType));
    }
  };

  // Manual Controls (ปุ่มกดเอง)
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

  // Auto Play Controls (เล่นอัตโนมัติ)
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
            setTimeout(() => {
              reset();
            }, 2500);

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

  return {
    run,
    stop,
    reset,
    nextStep,
    prevStep,
    skipBack,
    skipForward,
    isRunning,
    currentStep,
    steps,
    stepToCodeLine: steps.map((s) => s.codeLine),
  };
}
