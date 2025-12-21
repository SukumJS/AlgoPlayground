import { AlgorithmStep, ArrayElement } from '@/types';
import {
  createStep,
  createArrayElements,
  updateElementStates,
  markAllSorted,
  resetStepCounter,
  AlgorithmCode,
} from '../base';

// ===========================================
// Merge Sort Step Generator
// ===========================================

export function generateMergeSortSteps(input: number[]): AlgorithmStep[] {
  resetStepCounter();
  const steps: AlgorithmStep[] = [];
  const arr = [...input];
  let elements = createArrayElements(arr);

  // Initial state
  steps.push(
    createStep('initialize', 'Starting Merge Sort algorithm', {
      array: elements,
      message: `Array to sort: [${input.join(', ')}]`,
    }, [1])
  );

  // Helper to create elements with range highlighting
  function createElementsWithRange(
    currentArr: number[],
    left: number,
    right: number,
    state: 'current' | 'comparing' | 'sorted' = 'current'
  ): ArrayElement[] {
    return currentArr.map((value, index) => ({
      id: `el-${index}`,
      value,
      state: index >= left && index <= right ? state : 'default',
    }));
  }

  // Recursive merge sort with step generation
  function mergeSort(arr: number[], left: number, right: number, depth: number = 0): void {
    if (left >= right) {
      if (left === right) {
        elements = createElementsWithRange(arr, left, right, 'sorted');
        steps.push(
          createStep('initialize', `Base case: Single element [${arr[left]}] at index ${left}`, {
            array: elements,
            left,
            right,
            message: `Depth ${depth}: Single element is already sorted`,
          }, [2])
        );
      }
      return;
    }

    const mid = Math.floor((left + right) / 2);

    // Show split
    elements = createElementsWithRange(arr, left, right);
    steps.push(
      createStep('split', `Splitting [${arr.slice(left, right + 1).join(', ')}] at index ${mid}`, {
        array: elements,
        left,
        right,
        mid,
        message: `Depth ${depth}: Split into [${arr.slice(left, mid + 1).join(', ')}] and [${arr.slice(mid + 1, right + 1).join(', ')}]`,
      }, [3, 4])
    );

    // Recursively sort left half
    mergeSort(arr, left, mid, depth + 1);

    // Recursively sort right half
    mergeSort(arr, mid + 1, right, depth + 1);

    // Merge the sorted halves
    merge(arr, left, mid, right, depth);
  }

  function merge(arr: number[], left: number, mid: number, right: number, depth: number): void {
    // Create temporary arrays
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    elements = createElementsWithRange(arr, left, right, 'comparing');
    steps.push(
      createStep('merge', `Merging [${leftArr.join(', ')}] and [${rightArr.join(', ')}]`, {
        array: elements,
        left,
        right,
        mid,
        message: `Depth ${depth}: Merging two sorted halves`,
      }, [5])
    );

    let i = 0; // Index for left array
    let j = 0; // Index for right array
    let k = left; // Index for merged array

    // Merge while both arrays have elements
    while (i < leftArr.length && j < rightArr.length) {
      elements = arr.map((value, index) => ({
        id: `el-${index}`,
        value,
        state:
          index === k
            ? 'current'
            : index >= left && index <= right
              ? 'comparing'
              : 'default',
      }));

      if (leftArr[i] <= rightArr[j]) {
        steps.push(
          createStep('compare', `Comparing ${leftArr[i]} ≤ ${rightArr[j]}, taking ${leftArr[i]}`, {
            array: elements,
            message: `${leftArr[i]} from left array goes to position ${k}`,
            variables: { leftVal: leftArr[i], rightVal: rightArr[j], position: k },
          }, [6, 7])
        );
        arr[k] = leftArr[i];
        i++;
      } else {
        steps.push(
          createStep('compare', `Comparing ${leftArr[i]} > ${rightArr[j]}, taking ${rightArr[j]}`, {
            array: elements,
            message: `${rightArr[j]} from right array goes to position ${k}`,
            variables: { leftVal: leftArr[i], rightVal: rightArr[j], position: k },
          }, [8, 9])
        );
        arr[k] = rightArr[j];
        j++;
      }
      k++;

      // Show current state
      elements = createElementsWithRange(arr, left, k - 1, 'sorted');
      steps.push(
        createStep('move', `Placed element at position ${k - 1}`, {
          array: elements,
          message: `Current merged portion: [${arr.slice(left, k).join(', ')}]`,
        }, [10])
      );
    }

    // Copy remaining elements from left array
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      
      elements = createElementsWithRange(arr, left, k, 'sorted');
      steps.push(
        createStep('move', `Copying remaining ${leftArr[i]} from left array`, {
          array: elements,
          message: `No more elements in right array`,
        }, [11])
      );
      
      i++;
      k++;
    }

    // Copy remaining elements from right array
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      
      elements = createElementsWithRange(arr, left, k, 'sorted');
      steps.push(
        createStep('move', `Copying remaining ${rightArr[j]} from right array`, {
          array: elements,
          message: `No more elements in left array`,
        }, [12])
      );
      
      j++;
      k++;
    }

    // Show merged result
    elements = createElementsWithRange(arr, left, right, 'sorted');
    steps.push(
      createStep('merge', `Merged result: [${arr.slice(left, right + 1).join(', ')}]`, {
        array: elements,
        left,
        right,
        message: `Depth ${depth}: Merge complete`,
      }, [13])
    );
  }

  // Run merge sort
  mergeSort(arr, 0, arr.length - 1);

  // Final state
  elements = markAllSorted(createArrayElements(arr));
  steps.push(
    createStep('complete', 'Merge Sort complete!', {
      array: elements,
      sortedIndices: elements.map((_, idx) => idx),
      message: `Sorted array: [${arr.join(', ')}]`,
    }, [14])
  );

  return steps;
}

// ===========================================
// Code Snippets
// ===========================================

export const mergeSortCode: AlgorithmCode = {
  javascript: {
    language: 'javascript',
    code: `function mergeSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;
  
  const mid = Math.floor((left + right) / 2);
  
  // Sort left half
  mergeSort(arr, left, mid);
  // Sort right half
  mergeSort(arr, mid + 1, right);
  // Merge sorted halves
  merge(arr, left, mid, right);
  
  return arr;
}

function merge(arr, left, mid, right) {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);
  
  let i = 0, j = 0, k = left;
  
  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      arr[k++] = leftArr[i++];
    } else {
      arr[k++] = rightArr[j++];
    }
  }
  
  while (i < leftArr.length) arr[k++] = leftArr[i++];
  while (j < rightArr.length) arr[k++] = rightArr[j++];
}`,
  },
  python: {
    language: 'python',
    code: `def merge_sort(arr, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    if left >= right:
        return
    
    mid = (left + right) // 2
    
    # Sort left half
    merge_sort(arr, left, mid)
    # Sort right half
    merge_sort(arr, mid + 1, right)
    # Merge sorted halves
    merge(arr, left, mid, right)
    
    return arr

def merge(arr, left, mid, right):
    left_arr = arr[left:mid + 1]
    right_arr = arr[mid + 1:right + 1]
    
    i = j = 0
    k = left
    
    while i < len(left_arr) and j < len(right_arr):
        if left_arr[i] <= right_arr[j]:
            arr[k] = left_arr[i]
            i += 1
        else:
            arr[k] = right_arr[j]
            j += 1
        k += 1
    
    while i < len(left_arr):
        arr[k] = left_arr[i]
        i += 1
        k += 1
    
    while j < len(right_arr):
        arr[k] = right_arr[j]
        j += 1
        k += 1`,
  },
};
