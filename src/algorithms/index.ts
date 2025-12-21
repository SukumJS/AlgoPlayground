// ===========================================
// Base utilities and types
// ===========================================
export * from './base';

// ===========================================
// Sorting Algorithms
// ===========================================
export * from './sorting';

// ===========================================
// Searching Algorithms
// ===========================================
export * from './searching';

// ===========================================
// Graph Algorithms
// ===========================================
export * from './graph';

// ===========================================
// Tree Algorithms (placeholder)
// ===========================================
export * from './tree';

// ===========================================
// Linear Data Structures (placeholder)
// ===========================================
export * from './linear';

// ===========================================
// Algorithm Registration
// ===========================================
import { registerAlgorithm } from './base';
import { generateBubbleSortSteps } from './sorting/bubble-sort';
import { generateSelectionSortSteps } from './sorting/selection-sort';
import { generateInsertionSortSteps } from './sorting/insertion-sort';
import { generateMergeSortSteps } from './sorting/merge-sort';
import { generateLinearSearchSteps, LinearSearchInput } from './searching/linear-search';
import { generateBinarySearchSteps, BinarySearchInput } from './searching/binary-search';
import { generateBFSSteps, BFSInput } from './graph/bfs';
import { generateDFSSteps, DFSInput } from './graph/dfs';

// Register all algorithms
export function initializeAlgorithms() {
  // Sorting
  registerAlgorithm('bubble-sort', generateBubbleSortSteps);
  registerAlgorithm('selection-sort', generateSelectionSortSteps);
  registerAlgorithm('insertion-sort', generateInsertionSortSteps);
  registerAlgorithm('merge-sort', generateMergeSortSteps);
  
  // Searching
  registerAlgorithm<LinearSearchInput>('linear-search', generateLinearSearchSteps);
  registerAlgorithm<BinarySearchInput>('binary-search', generateBinarySearchSteps);
  
  // Graph
  registerAlgorithm<BFSInput>('bfs', generateBFSSteps);
  registerAlgorithm<DFSInput>('dfs', generateDFSSteps);
  
  // TODO: Register tree algorithms
  // TODO: Register linear structure algorithms
}

// ===========================================
// Code Snippets Export
// ===========================================
import { bubbleSortCode } from './sorting/bubble-sort';
import { selectionSortCode } from './sorting/selection-sort';
import { insertionSortCode } from './sorting/insertion-sort';
import { mergeSortCode } from './sorting/merge-sort';
import { linearSearchCode } from './searching/linear-search';
import { binarySearchCode } from './searching/binary-search';
import { bfsCode } from './graph/bfs';
import { dfsCode } from './graph/dfs';
import { AlgorithmSlug } from '@/types';
import { AlgorithmCode } from './base';

export const algorithmCodes: Partial<Record<AlgorithmSlug, AlgorithmCode>> = {
  'bubble-sort': bubbleSortCode,
  'selection-sort': selectionSortCode,
  'insertion-sort': insertionSortCode,
  'merge-sort': mergeSortCode,
  'linear-search': linearSearchCode,
  'binary-search': binarySearchCode,
  'bfs': bfsCode,
  'dfs': dfsCode,
};

export function getAlgorithmCode(slug: AlgorithmSlug): AlgorithmCode | undefined {
  return algorithmCodes[slug];
}
