import { AlgorithmStep, ArrayElement } from '@/types';
import {
  createStep,
  createArrayElements,
  updateElementStates,
  resetStepCounter,
  AlgorithmCode,
} from '../base';

// ===========================================
// Linear Search Input Type
// ===========================================

export interface LinearSearchInput {
  array: number[];
  target: number;
}

// ===========================================
// Linear Search Step Generator
// ===========================================

export function generateLinearSearchSteps(input: LinearSearchInput): AlgorithmStep[] {
  resetStepCounter();
  const steps: AlgorithmStep[] = [];
  const { array, target } = input;
  let elements = createArrayElements([...array]);
  const n = array.length;
  const visitedIndices: number[] = [];

  // Initial state
  steps.push(
    createStep('initialize', `Starting Linear Search for target: ${target}`, {
      array: elements,
      target,
      message: `Array: [${array.join(', ')}], Target: ${target}`,
    }, [1])
  );

  // Search through array
  for (let i = 0; i < n; i++) {
    // Highlight current element
    elements = updateElementStates(elements, [
      { indices: [i], state: 'current' },
      { indices: visitedIndices, state: 'visited' },
    ]);

    steps.push(
      createStep('compare', `Checking index ${i}: Is ${array[i]} equal to ${target}?`, {
        array: elements,
        target,
        left: 0,
        right: n - 1,
        mid: i,
        visitedNodes: [...visitedIndices],
        message: `Comparing array[${i}] = ${array[i]} with target ${target}`,
        variables: { currentIndex: i, currentValue: array[i] },
      }, [2, 3])
    );

    if (array[i] === target) {
      // Found!
      elements = updateElementStates(elements, [
        { indices: [i], state: 'found' },
        { indices: visitedIndices, state: 'visited' },
      ]);

      steps.push(
        createStep('found', `Found ${target} at index ${i}!`, {
          array: elements,
          target,
          found: true,
          foundIndex: i,
          message: `Target ${target} found at index ${i}`,
        }, [4])
      );

      return steps;
    }

    // Not found, mark as visited
    visitedIndices.push(i);
    elements = updateElementStates(elements, [
      { indices: visitedIndices, state: 'visited' },
    ]);

    steps.push(
      createStep('compare', `${array[i]} ≠ ${target}, continue searching`, {
        array: elements,
        target,
        visitedNodes: [...visitedIndices],
        message: `${array[i]} is not the target, moving to next element`,
      }, [5])
    );
  }

  // Not found after searching entire array
  elements = updateElementStates(elements, [
    { indices: visitedIndices, state: 'not-found' },
  ]);

  steps.push(
    createStep('not-found', `Target ${target} not found in the array`, {
      array: elements,
      target,
      found: false,
      message: `Searched all ${n} elements, target ${target} not found`,
    }, [6])
  );

  return steps;
}

// ===========================================
// Code Snippets
// ===========================================

export const linearSearchCode: AlgorithmCode = {
  javascript: {
    language: 'javascript',
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found at index i
    }
  }
  return -1; // Not found
}`,
    lineMapping: {
      1: 'Function definition',
      2: 'Loop through each element',
      3: 'Check if current element matches target',
      4: 'Return index if found',
      5: 'Continue to next element',
      6: 'Return -1 if not found',
    },
  },
  python: {
    language: 'python',
    code: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Found at index i
    return -1  # Not found`,
  },
};
