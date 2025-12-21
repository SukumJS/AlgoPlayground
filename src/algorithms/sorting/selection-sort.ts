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
// Selection Sort Step Generator
// ===========================================

export function generateSelectionSortSteps(input: number[]): AlgorithmStep[] {
  resetStepCounter();
  const steps: AlgorithmStep[] = [];
  let elements = createArrayElements([...input]);
  const n = elements.length;
  const sortedIndices: number[] = [];

  // Initial state
  steps.push(
    createStep('initialize', 'Starting Selection Sort algorithm', {
      array: elements,
      message: `Array to sort: [${input.join(', ')}]`,
    }, [1])
  );

  // Main sorting loop
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // Highlight current position
    elements = updateElementStates(elements, [
      { indices: [i], state: 'current' },
      { indices: sortedIndices, state: 'sorted' },
    ]);

    steps.push(
      createStep('initialize', `Pass ${i + 1}: Finding minimum in unsorted portion`, {
        array: elements,
        sortedIndices: [...sortedIndices],
        message: `Looking for minimum starting from index ${i}`,
        variables: { minIdx: i, minValue: elements[i].value },
      }, [2, 3])
    );

    // Mark initial minimum
    elements = updateElementStates(elements, [
      { indices: [minIdx], state: 'minimum' },
      { indices: sortedIndices, state: 'sorted' },
    ]);

    steps.push(
      createStep('initialize', `Current minimum: ${elements[minIdx].value} at index ${minIdx}`, {
        array: elements,
        sortedIndices: [...sortedIndices],
        variables: { minIdx, minValue: elements[minIdx].value },
      }, [3])
    );

    // Find minimum in unsorted portion
    for (let j = i + 1; j < n; j++) {
      // Highlight element being compared
      elements = updateElementStates(elements, [
        { indices: [minIdx], state: 'minimum' },
        { indices: [j], state: 'comparing' },
        { indices: sortedIndices, state: 'sorted' },
      ]);

      steps.push(
        createStep('compare', `Comparing ${elements[j].value} with current minimum ${elements[minIdx].value}`, {
          array: elements,
          comparing: [minIdx, j] as [number, number],
          sortedIndices: [...sortedIndices],
          variables: { minIdx, minValue: elements[minIdx].value },
        }, [4, 5])
      );

      if (elements[j].value < elements[minIdx].value) {
        const oldMinIdx = minIdx;
        minIdx = j;

        elements = updateElementStates(elements, [
          { indices: [minIdx], state: 'minimum' },
          { indices: sortedIndices, state: 'sorted' },
        ]);

        steps.push(
          createStep('compare', `Found new minimum: ${elements[minIdx].value} at index ${minIdx}`, {
            array: elements,
            sortedIndices: [...sortedIndices],
            message: `${elements[minIdx].value} < ${elements[oldMinIdx].value}, update minimum`,
            variables: { minIdx, minValue: elements[minIdx].value },
          }, [6])
        );
      }
    }

    // Swap if minimum is not at current position
    if (minIdx !== i) {
      elements = updateElementStates(elements, [
        { indices: [i, minIdx], state: 'swapping' },
        { indices: sortedIndices, state: 'sorted' },
      ]);

      steps.push(
        createStep('swap', `Swapping ${elements[i].value} at index ${i} with minimum ${elements[minIdx].value} at index ${minIdx}`, {
          array: elements,
          swapping: [i, minIdx] as [number, number],
          sortedIndices: [...sortedIndices],
        }, [7])
      );

      elements = swapElements(elements, i, minIdx);

      elements = updateElementStates(elements, [
        { indices: [i], state: 'current' },
        { indices: sortedIndices, state: 'sorted' },
      ]);

      steps.push(
        createStep('swap', `Swapped! ${elements[i].value} is now at index ${i}`, {
          array: elements,
          sortedIndices: [...sortedIndices],
        }, [7])
      );
    } else {
      steps.push(
        createStep('compare', `${elements[i].value} is already in correct position`, {
          array: elements,
          sortedIndices: [...sortedIndices],
          message: 'No swap needed',
        }, [7])
      );
    }

    // Mark current position as sorted
    sortedIndices.push(i);
    elements = markSorted(elements, sortedIndices);

    steps.push(
      createStep('mark-sorted', `Position ${i} is now sorted with value ${elements[i].value}`, {
        array: elements,
        sortedIndices: [...sortedIndices],
        message: `Sorted portion: [${sortedIndices.map(idx => elements[idx].value).join(', ')}]`,
      }, [8])
    );
  }

  // Mark last element as sorted
  elements = markAllSorted(elements);
  steps.push(
    createStep('complete', 'Selection Sort complete!', {
      array: elements,
      sortedIndices: elements.map((_, idx) => idx),
      message: `Sorted array: [${elements.map(e => e.value).join(', ')}]`,
    }, [9])
  );

  return steps;
}

// ===========================================
// Code Snippets
// ===========================================

export const selectionSortCode: AlgorithmCode = {
  javascript: {
    language: 'javascript',
    code: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    // Find minimum in unsorted portion
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    // Swap minimum with current position
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`,
  },
  python: {
    language: 'python',
    code: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        # Find minimum in unsorted portion
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        # Swap minimum with current position
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
  },
};
