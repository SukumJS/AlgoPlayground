import { AlgorithmStep, ArrayElement } from '@/types';
import {
  createStep,
  createArrayElements,
  updateElementStates,
  markSorted,
  markAllSorted,
  resetStepCounter,
  AlgorithmCode,
} from '../base';

// ===========================================
// Insertion Sort Step Generator
// ===========================================

export function generateInsertionSortSteps(input: number[]): AlgorithmStep[] {
  resetStepCounter();
  const steps: AlgorithmStep[] = [];
  const arr = [...input];
  let elements = createArrayElements(arr);
  const n = arr.length;

  // Initial state
  steps.push(
    createStep('initialize', 'Starting Insertion Sort algorithm', {
      array: elements,
      message: `Array to sort: [${input.join(', ')}]`,
    }, [1])
  );

  // First element is considered sorted
  elements = updateElementStates(elements, [{ indices: [0], state: 'sorted' }]);
  
  steps.push(
    createStep('initialize', `First element ${arr[0]} is already sorted`, {
      array: elements,
      sortedIndices: [0],
      message: 'Single element is trivially sorted',
    }, [2])
  );

  // Main sorting loop
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    // Highlight key element
    elements = createArrayElements(arr);
    elements = updateElementStates(elements, [
      { indices: [i], state: 'current' },
      { indices: Array.from({ length: i }, (_, k) => k), state: 'sorted' },
    ]);

    steps.push(
      createStep('initialize', `Inserting ${key} into sorted portion`, {
        array: elements,
        sortedIndices: Array.from({ length: i }, (_, k) => k),
        message: `Key element: ${key}, sorted portion: [${arr.slice(0, i).join(', ')}]`,
        variables: { key, i },
      }, [3, 4])
    );

    // Compare and shift
    let shifted = false;
    while (j >= 0 && arr[j] > key) {
      // Highlight comparison
      elements = createArrayElements(arr);
      elements = updateElementStates(elements, [
        { indices: [j], state: 'comparing' },
        { indices: [i], state: 'current' },
      ]);

      steps.push(
        createStep('compare', `Comparing ${arr[j]} > ${key}?`, {
          array: elements,
          comparing: [j, i] as [number, number],
          message: `${arr[j]} > ${key}, need to shift`,
          variables: { key, j, comparing: arr[j] },
        }, [5])
      );

      // Shift element right
      arr[j + 1] = arr[j];
      elements = createArrayElements(arr);
      elements = updateElementStates(elements, [
        { indices: [j + 1], state: 'swapping' },
      ]);

      steps.push(
        createStep('move', `Shifting ${arr[j + 1]} to position ${j + 1}`, {
          array: elements,
          message: `Moved ${arr[j + 1]} right to make room`,
          variables: { key, j },
        }, [6])
      );

      j--;
      shifted = true;
    }

    // Insert key at correct position
    arr[j + 1] = key;
    elements = createArrayElements(arr);
    
    if (j >= 0) {
      elements = updateElementStates(elements, [
        { indices: [j], state: 'comparing' },
        { indices: [j + 1], state: 'current' },
      ]);

      steps.push(
        createStep('compare', `${arr[j]} ≤ ${key}, stop shifting`, {
          array: elements,
          message: `Found correct position for ${key}`,
          variables: { key, insertPosition: j + 1 },
        }, [5])
      );
    }

    elements = createArrayElements(arr);
    elements = updateElementStates(elements, [
      { indices: [j + 1], state: 'highlight' },
      { indices: Array.from({ length: i + 1 }, (_, k) => k).filter(k => k !== j + 1), state: 'sorted' },
    ]);

    steps.push(
      createStep('insert', `Inserted ${key} at position ${j + 1}`, {
        array: elements,
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
        message: shifted 
          ? `Inserted ${key} at position ${j + 1}`
          : `${key} stays in place (already in correct position)`,
      }, [7])
    );

    // Show sorted portion
    elements = updateElementStates(elements, [
      { indices: Array.from({ length: i + 1 }, (_, k) => k), state: 'sorted' },
    ]);

    steps.push(
      createStep('mark-sorted', `Sorted portion: [${arr.slice(0, i + 1).join(', ')}]`, {
        array: elements,
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
      }, [8])
    );
  }

  // Mark all as sorted
  elements = markAllSorted(elements);
  steps.push(
    createStep('complete', 'Insertion Sort complete!', {
      array: elements,
      sortedIndices: elements.map((_, idx) => idx),
      message: `Sorted array: [${arr.join(', ')}]`,
    }, [9])
  );

  return steps;
}

// ===========================================
// Code Snippets
// ===========================================

export const insertionSortCode: AlgorithmCode = {
  javascript: {
    language: 'javascript',
    code: `function insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    // Shift elements greater than key
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    // Insert key at correct position
    arr[j + 1] = key;
  }
  return arr;
}`,
  },
  python: {
    language: 'python',
    code: `def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        # Shift elements greater than key
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        # Insert key at correct position
        arr[j + 1] = key
    return arr`,
  },
};
