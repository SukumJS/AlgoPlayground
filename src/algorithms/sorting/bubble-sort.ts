import { AlgorithmStep, ArrayElement } from '@/types';
import {
  createStep,
  createArrayElements,
  updateElementStates,
  swapElements,
  markSorted,
  markAllSorted,
  resetStepCounter,
  AlgorithmCode,
} from '../base';

// ===========================================
// Bubble Sort Step Generator
// ===========================================

export function generateBubbleSortSteps(input: number[]): AlgorithmStep[] {
  resetStepCounter();
  const steps: AlgorithmStep[] = [];
  let elements = createArrayElements([...input]);
  const n = elements.length;
  const sortedIndices: number[] = [];

  // Initial state
  steps.push(
    createStep('initialize', 'Starting Bubble Sort algorithm', {
      array: elements,
      message: `Array to sort: [${input.join(', ')}]`,
    }, [1])
  );

  // Main sorting loop
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    steps.push(
      createStep('initialize', `Pass ${i + 1}: Comparing adjacent elements`, {
        array: elements,
        sortedIndices: [...sortedIndices],
        message: `Starting pass ${i + 1} of ${n - 1}`,
      }, [2])
    );

    for (let j = 0; j < n - i - 1; j++) {
      // Highlight elements being compared
      elements = updateElementStates(elements, [
        { indices: [j, j + 1], state: 'comparing' },
        { indices: sortedIndices, state: 'sorted' },
      ]);

      steps.push(
        createStep('compare', `Comparing ${elements[j].value} and ${elements[j + 1].value}`, {
          array: elements,
          comparing: [j, j + 1] as [number, number],
          sortedIndices: [...sortedIndices],
          message: `Is ${elements[j].value} > ${elements[j + 1].value}?`,
        }, [3, 4])
      );

      if (elements[j].value > elements[j + 1].value) {
        // Show swap state
        elements = updateElementStates(elements, [
          { indices: [j, j + 1], state: 'swapping' },
          { indices: sortedIndices, state: 'sorted' },
        ]);

        steps.push(
          createStep('swap', `Swapping ${elements[j].value} and ${elements[j + 1].value}`, {
            array: elements,
            swapping: [j, j + 1] as [number, number],
            sortedIndices: [...sortedIndices],
            message: `${elements[j].value} > ${elements[j + 1].value}, so swap them`,
          }, [5])
        );

        // Perform swap
        elements = swapElements(elements, j, j + 1);
        swapped = true;

        // Show result after swap
        elements = updateElementStates(elements, [
          { indices: [j, j + 1], state: 'current' },
          { indices: sortedIndices, state: 'sorted' },
        ]);

        steps.push(
          createStep('swap', `Swapped! Array is now: [${elements.map(e => e.value).join(', ')}]`, {
            array: elements,
            sortedIndices: [...sortedIndices],
          }, [5])
        );
      } else {
        // No swap needed
        elements = updateElementStates(elements, [
          { indices: [j, j + 1], state: 'current' },
          { indices: sortedIndices, state: 'sorted' },
        ]);

        steps.push(
          createStep('compare', `No swap needed (${elements[j].value} ≤ ${elements[j + 1].value})`, {
            array: elements,
            sortedIndices: [...sortedIndices],
            message: `${elements[j].value} ≤ ${elements[j + 1].value}, continue`,
          }, [4])
        );
      }
    }

    // Mark the last unsorted element as sorted
    sortedIndices.unshift(n - 1 - i);
    elements = markSorted(elements, sortedIndices);

    steps.push(
      createStep('mark-sorted', `Element ${elements[n - 1 - i].value} is now in its final position`, {
        array: elements,
        sortedIndices: [...sortedIndices],
        message: `Pass ${i + 1} complete. ${elements[n - 1 - i].value} bubbled to position ${n - 1 - i}`,
      }, [6])
    );

    // Early termination if no swaps
    if (!swapped) {
      elements = markAllSorted(elements);
      steps.push(
        createStep('complete', 'Array is already sorted! (No swaps in this pass)', {
          array: elements,
          sortedIndices: elements.map((_, idx) => idx),
          message: 'Early termination: No swaps needed',
        }, [7])
      );
      return steps;
    }
  }

  // Mark all as sorted
  elements = markAllSorted(elements);
  steps.push(
    createStep('complete', 'Bubble Sort complete!', {
      array: elements,
      sortedIndices: elements.map((_, idx) => idx),
      message: `Sorted array: [${elements.map(e => e.value).join(', ')}]`,
    }, [8])
  );

  return steps;
}

// ===========================================
// Code Snippets
// ===========================================

export const bubbleSortCode: AlgorithmCode = {
  javascript: {
    language: 'javascript',
    code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    // If no swaps, array is sorted
    if (!swapped) break;
  }
  return arr;
}`,
    lineMapping: {
      1: 'Function definition',
      2: 'Get array length',
      3: 'Outer loop - each pass',
      4: 'Track if any swaps made',
      5: 'Inner loop - compare adjacent',
      6: 'Compare adjacent elements',
      7: 'Swap if left > right',
      8: 'Mark that swap occurred',
      9: 'End inner loop',
      10: 'Early exit if sorted',
      11: 'End outer loop',
      12: 'Return sorted array',
    },
  },
  python: {
    language: 'python',
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        # If no swaps, array is sorted
        if not swapped:
            break
    return arr`,
  },
};
