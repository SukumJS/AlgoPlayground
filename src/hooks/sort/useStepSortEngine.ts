import { useState, useRef, useEffect } from "react";
import type { Node } from "@xyflow/react";
import type { SortNodeData } from "@/src/components/shared/sortNode";
import { generateStepsByType } from "@/src/components/visualizer/algorithmsSort/generateSteps";
import { getExplanation } from "@/src/components/visualizer/explanations";
import { makeContext } from "@/src/components/visualizer/explanations/explanationUtils";
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
  const [stepToCodeLine, setStepToCodeLine] = useState<number[]>([]);

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
    setStepToCodeLine(buildStepToCodeLineMap(algoType, generated));

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
    stepToCodeLine,
  };
}

function buildStepToCodeLineMap(
  algoType: string | null,
  steps: Node<SortNodeData>[][],
): number[] {
  if (!algoType || steps.length === 0) return [];

  switch (algoType) {
    case "bubble-sort":
      return mapBubbleSortStepsToLines(steps);
    case "selection-sort":
      return mapSelectionSortStepsToLines(steps);
    case "insertion-sort":
      return mapInsertionSortStepsToLines(steps);
    case "merge-sort":
      return mapMergeSortStepsToLines(steps);
    default:
      return [];
  }
}

/**
 * BubbleSort pseudocode lines (1-based) expected in `codebubblesort.tsx`:
 * 1  ALGORITHM BubbleSort(list)
 * 2    n = length of list
 * 3    FOR i FROM 0 TO n - 1 DO
 * 4        FOR j FROM 0 TO n - i - 2 DO
 * 5            IF list[j] > list[j + 1] THEN
 * 6                SWAP list[j] WITH list[j + 1]
 * 7            END IF
 * 8        END FOR
 * 9    END FOR
 * 10 END ALGORITHM
 */
function mapBubbleSortStepsToLines(steps: Node<SortNodeData>[][]): number[] {
  const out: number[] = [];

  for (let idx = 0; idx < steps.length; idx++) {
    if (idx === 0) {
      out.push(1);
      continue;
    }

    const ctx = makeContext(steps[idx], steps[idx - 1]);

    if (ctx.newlyComparing.length === 2) {
      // just started a comparison => corresponds to the IF condition line
      out.push(5);
      continue;
    }

    if (ctx.newlySwapping.length === 2) {
      // swap animation step
      out.push(6);
      continue;
    }

    if (ctx.justResetToIdle.length === 2) {
      // finished IF (either swapped or not)
      out.push(7);
      continue;
    }

    if (ctx.newlySorted.length > 0) {
      // end of inner loop / bubbling largest to final position
      out.push(8);
      continue;
    }

    // default: we are iterating in loops
    out.push(4);
  }

  return out;
}

/**
 * SelectionSort pseudocode lines (1-based) expected in `codeselectionsort.tsx`
 */
function mapSelectionSortStepsToLines(steps: Node<SortNodeData>[][]): number[] {
  const out: number[] = [];

  for (let idx = 0; idx < steps.length; idx++) {
    if (idx === 0) {
      out.push(1);
      continue;
    }

    const ctx = makeContext(steps[idx], steps[idx - 1]);

    if (ctx.newlyComparing.length > 0) {
      out.push(6);
      continue;
    }

    if (ctx.newlySwapping.length === 2) {
      out.push(11);
      continue;
    }

    if (ctx.newlySorted.length > 0) {
      out.push(13);
      continue;
    }

    if (ctx.justResetToIdle.length > 0) {
      // finished IF compare block
      out.push(8);
      continue;
    }

    out.push(5);
  }

  return out;
}

/**
 * InsertionSort pseudocode lines (1-based) expected in `codeinsertingsort.tsx`
 */
function mapInsertionSortStepsToLines(steps: Node<SortNodeData>[][]): number[] {
  const out: number[] = [];

  for (let idx = 0; idx < steps.length; idx++) {
    if (idx === 0) {
      out.push(1);
      continue;
    }

    const current = steps[idx];
    const prev = steps[idx - 1];
    const ctx = makeContext(current, prev);

    const compareNodes = current.filter((n) => n.data.status === "compare");
    const swapNodes = current.filter((n) => n.data.status === "swap");

    // Lift: picked one item (compare) before while loop shifts
    if (compareNodes.length === 1 && swapNodes.length === 0) {
      out.push(4);
      continue;
    }

    // While compare step
    if (compareNodes.length === 2) {
      out.push(6);
      continue;
    }

    // Shift step (our animation marks both nodes as swap)
    if (swapNodes.length === 2) {
      out.push(7);
      continue;
    }

    // Drop/insert key back into array (prev had lifted compare at y<0, now idle)
    const prevLifted = prev.find(
      (n) => n.data.status === "compare" && n.position.y < 0,
    );
    if (prevLifted) {
      const nowIdleSame = current.find(
        (n) => n.id === prevLifted.id && n.data.status === "idle",
      );
      if (nowIdleSame) {
        out.push(10);
        continue;
      }
    }

    // also use generic reset-to-idle as end of while iteration
    if (ctx.justResetToIdle.length > 0) {
      out.push(9);
      continue;
    }

    out.push(3);
  }

  return out;
}

/**
 * Merge pseudocode lines (1-based) expected in `codemergesort.tsx`
 *
 * 1  ALGORITHM Merge(left, right)
 * 2      result = empty list
 * 3      WHILE left not empty AND right not empty DO
 * 4          IF left[0] <= right[0] THEN
 * 5              append left[0] to result; remove left[0]
 * 6          ELSE
 * 7              append right[0] to result; remove right[0]
 * 8          END IF
 * 9      END WHILE
 * 10     append remaining items of left/right to result
 * 11     RETURN result
 * 12 END ALGORITHM
 */
function mapMergeSortStepsToLines(steps: Node<SortNodeData>[][]): number[] {
  const out: number[] = [];

  for (let idx = 0; idx < steps.length; idx++) {
    if (idx === 0) {
      // initial unsorted state
      out.push(1);
      continue;
    }

    const ctx = makeContext(steps[idx], steps[idx - 1]);

    if (ctx.newlyComparing.length === 2) {
      // เรากำลังตัดสินใจว่าจะหยิบจากซ้ายหรือขวา → IF เงื่อนไข
      out.push(4);
      continue;
    }

    if (ctx.newlyMerging.length > 0) {
      // กำลังย้าย element หนึ่งตัวลง subarray ที่ merge อยู่ → append
      out.push(5);
      continue;
    }

    if (ctx.justResetToIdle.length > 0) {
      // จบรอบของ IF / WHILE หนึ่งครั้ง
      out.push(9);
      continue;
    }

    // สถานะอื่น ๆ: ถือว่าอยู่ในลูป WHILE รวมๆ
    out.push(3);
  }

  return out;
}
