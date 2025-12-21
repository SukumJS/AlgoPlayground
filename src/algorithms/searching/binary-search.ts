import { AlgorithmStep, ArrayElement } from '@/types';
import {
  createStep,
  createArrayElements,
  updateElementStates,
  resetStepCounter,
  AlgorithmCode,
} from '../base';

// ===========================================
// Binary Search Input Type
// ===========================================

export interface BinarySearchInput {
  array: number[]; // Must be sorted
  target: number;
}

// ===========================================
// Binary Search Step Generator
// ===========================================

export function generateBinarySearchSteps(input: BinarySearchInput): AlgorithmStep[] {
  resetStepCounter();
  const steps: AlgorithmStep[] = [];
  const { array, target } = input;
  let elements = createArrayElements([...array]);
  const n = array.length;

  // Check if array is sorted
  const isSorted = array.every((val, i) => i === 0 || array[i - 1] <= val);

  // Initial state
  steps.push(
    createStep('initialize', `Starting Binary Search for target: ${target}`, {
      array: elements,
      target,
      message: `Sorted array: [${array.join(', ')}], Target: ${target}`,
    }, [1])
  );

  if (!isSorted) {
    steps.push(
      createStep('initialize', 'Warning: Array should be sorted for Binary Search!', {
        array: elements,
        target,
        message: 'Binary Search requires a sorted array',
      })
    );
  }

  let left = 0;
  let right = n - 1;
  const eliminatedIndices: number[] = [];

  // Show initial range
  elements = elements.map((el, index) => ({
    ...el,
    state: index >= left && index <= right ? 'current' : 'default',
  }));

  steps.push(
    createStep('initialize', `Search range: index ${left} to ${right}`, {
      array: elements,
      target,
      left,
      right,
      message: `Searching in range [${left}, ${right}]`,
    }, [2])
  );

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // Highlight search range and middle element
    elements = array.map((value, index) => ({
      id: `el-${index}`,
      value,
      state:
        index === mid
          ? 'comparing'
          : index >= left && index <= right
            ? 'current'
            : eliminatedIndices.includes(index)
              ? 'visited'
              : 'default',
    }));

    steps.push(
      createStep('compare', `Middle index: ${mid}, value: ${array[mid]}`, {
        array: elements,
        target,
        left,
        right,
        mid,
        message: `mid = ⌊(${left} + ${right}) / 2⌋ = ${mid}, array[${mid}] = ${array[mid]}`,
        variables: { left, right, mid, midValue: array[mid] },
      }, [3, 4])
    );

    if (array[mid] === target) {
      // Found!
      elements = elements.map((el, index) => ({
        ...el,
        state: index === mid ? 'found' : eliminatedIndices.includes(index) ? 'visited' : 'default',
      }));

      steps.push(
        createStep('found', `Found ${target} at index ${mid}!`, {
          array: elements,
          target,
          found: true,
          foundIndex: mid,
          left,
          right,
          mid,
          message: `array[${mid}] = ${array[mid]} = ${target}. Target found!`,
        }, [5])
      );

      return steps;
    } else if (array[mid] < target) {
      // Target is in right half
      steps.push(
        createStep('compare', `${array[mid]} < ${target}, search right half`, {
          array: elements,
          target,
          left,
          right,
          mid,
          message: `${array[mid]} < ${target}, eliminate left half (indices ${left} to ${mid})`,
          variables: { comparison: `${array[mid]} < ${target}` },
        }, [6, 7])
      );

      // Mark eliminated elements
      for (let i = left; i <= mid; i++) {
        eliminatedIndices.push(i);
      }

      left = mid + 1;

      // Show new range
      elements = array.map((value, index) => ({
        id: `el-${index}`,
        value,
        state:
          index >= left && index <= right
            ? 'current'
            : eliminatedIndices.includes(index)
              ? 'visited'
              : 'default',
      }));

      steps.push(
        createStep('compare', `New search range: [${left}, ${right}]`, {
          array: elements,
          target,
          left,
          right,
          message: `Narrowed search to indices ${left} to ${right}`,
        }, [7])
      );
    } else {
      // Target is in left half
      steps.push(
        createStep('compare', `${array[mid]} > ${target}, search left half`, {
          array: elements,
          target,
          left,
          right,
          mid,
          message: `${array[mid]} > ${target}, eliminate right half (indices ${mid} to ${right})`,
          variables: { comparison: `${array[mid]} > ${target}` },
        }, [8, 9])
      );

      // Mark eliminated elements
      for (let i = mid; i <= right; i++) {
        eliminatedIndices.push(i);
      }

      right = mid - 1;

      // Show new range
      elements = array.map((value, index) => ({
        id: `el-${index}`,
        value,
        state:
          index >= left && index <= right
            ? 'current'
            : eliminatedIndices.includes(index)
              ? 'visited'
              : 'default',
      }));

      steps.push(
        createStep('compare', `New search range: [${left}, ${right}]`, {
          array: elements,
          target,
          left,
          right,
          message: `Narrowed search to indices ${left} to ${right}`,
        }, [9])
      );
    }
  }

  // Not found
  elements = array.map((value, index) => ({
    id: `el-${index}`,
    value,
    state: 'not-found',
  }));

  steps.push(
    createStep('not-found', `Target ${target} not found in the array`, {
      array: elements,
      target,
      found: false,
      left,
      right,
      message: `Search range exhausted (left=${left} > right=${right}). Target ${target} not found.`,
    }, [10])
  );

  return steps;
}

// ===========================================
// Code Snippets
// ===========================================

export const binarySearchCode: AlgorithmCode = {
  javascript: {
    language: 'javascript',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found
    } else if (arr[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }
  
  return -1; // Not found
}`,
    lineMapping: {
      1: 'Function definition',
      2: 'Initialize left pointer',
      3: 'Initialize right pointer',
      4: 'Continue while range is valid',
      5: 'Calculate middle index',
      6: 'Check if middle element is target',
      7: 'Return index if found',
      8: 'If target is greater, search right',
      9: 'Move left pointer',
      10: 'If target is smaller, search left',
      11: 'Move right pointer',
      12: 'End while loop',
      13: 'Return -1 if not found',
    },
  },
  python: {
    language: 'python',
    code: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid  # Found
        elif arr[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1  # Search left half
    
    return -1  # Not found`,
  },
};
