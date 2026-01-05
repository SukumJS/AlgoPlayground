import { AlgorithmMetadata, AlgorithmCategory } from '@/types';

// ===========================================
// Algorithm Metadata
// ===========================================

export const algorithms: AlgorithmMetadata[] = [
  // Sorting Algorithms
  {
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'SORTING',
    description: 'A simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    difficulty: 'easy',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    useCases: [
      'Educational purposes',
      'Small datasets',
      'Nearly sorted arrays',
    ],
  },
  {
    slug: 'selection-sort',
    name: 'Selection Sort',
    category: 'SORTING',
    description: 'An in-place comparison sorting algorithm that divides the input into a sorted and unsorted region, repeatedly selecting the smallest element from the unsorted region.',
    difficulty: 'easy',
    timeComplexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    useCases: [
      'Small datasets',
      'Memory-constrained environments',
      'When swap operations are costly',
    ],
  },
  {
    slug: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'SORTING',
    description: 'A simple sorting algorithm that builds the final sorted array one item at a time, similar to how you might sort playing cards in your hands.',
    difficulty: 'easy',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    useCases: [
      'Small datasets',
      'Nearly sorted arrays',
      'Online sorting (sorting as data arrives)',
    ],
  },
  {
    slug: 'merge-sort',
    name: 'Merge Sort',
    category: 'SORTING',
    description: 'An efficient, stable, divide-and-conquer sorting algorithm that divides the array into halves, sorts them recursively, and then merges the sorted halves.',
    difficulty: 'medium',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Large datasets',
      'Linked lists',
      'External sorting',
      'When stable sort is needed',
    ],
  },

  // Searching Algorithms
  {
    slug: 'linear-search',
    name: 'Linear Search',
    category: 'SEARCHING',
    description: 'A simple search algorithm that checks every element in the list sequentially until the target is found or the list ends.',
    difficulty: 'easy',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(1)',
    useCases: [
      'Unsorted arrays',
      'Small datasets',
      'Single search operations',
    ],
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    category: 'SEARCHING',
    description: 'An efficient search algorithm that repeatedly divides a sorted array in half, comparing the target with the middle element to determine which half to search next.',
    difficulty: 'easy',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(1)',
    useCases: [
      'Sorted arrays',
      'Large datasets',
      'Frequent search operations',
    ],
  },

  // Graph Algorithms
  {
    slug: 'bfs',
    name: 'Breadth-First Search',
    category: 'GRAPH',
    description: 'A graph traversal algorithm that explores all vertices at the present depth before moving to vertices at the next depth level, using a queue.',
    difficulty: 'medium',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    useCases: [
      'Shortest path in unweighted graphs',
      'Level-order traversal',
      'Finding connected components',
      'Web crawlers',
    ],
  },
  {
    slug: 'dfs',
    name: 'Depth-First Search',
    category: 'GRAPH',
    description: 'A graph traversal algorithm that explores as far as possible along each branch before backtracking, using a stack (or recursion).',
    difficulty: 'medium',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    useCases: [
      'Topological sorting',
      'Detecting cycles',
      'Path finding',
      'Maze solving',
    ],
  },

  // Tree Algorithms (Placeholders)
  {
    slug: 'bst-operations',
    name: 'BST Operations',
    category: 'TREE',
    description: 'Basic operations on Binary Search Trees including insertion, deletion, and search.',
    difficulty: 'medium',
    timeComplexity: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Dynamic sorted data',
      'Database indexing',
      'Priority queues',
    ],
  },
  {
    slug: 'tree-traversal',
    name: 'Tree Traversal',
    category: 'TREE',
    description: 'Methods to visit all nodes in a tree: Inorder, Preorder, Postorder, and Level-order traversals.',
    difficulty: 'easy',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(h)',
    useCases: [
      'Expression evaluation',
      'Tree copying',
      'Serialization',
    ],
  },

  // Linear Data Structures (Placeholders)
  {
    slug: 'linked-list',
    name: 'Linked List Operations',
    category: 'LINEAR',
    description: 'Operations on singly linked lists including insertion, deletion, and traversal.',
    difficulty: 'easy',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Dynamic memory allocation',
      'Implementing stacks/queues',
      'Undo functionality',
    ],
  },
  {
    slug: 'stack',
    name: 'Stack Operations',
    category: 'LINEAR',
    description: 'LIFO (Last In, First Out) data structure operations including push, pop, and peek.',
    difficulty: 'easy',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Function call management',
      'Expression evaluation',
      'Backtracking algorithms',
      'Undo/Redo operations',
    ],
  },
  {
    slug: 'queue',
    name: 'Queue Operations',
    category: 'LINEAR',
    description: 'FIFO (First In, First Out) data structure operations including enqueue, dequeue, and peek.',
    difficulty: 'easy',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Task scheduling',
      'BFS implementation',
      'Print queue',
      'Buffer management',
    ],
  },
];

// ===========================================
// Category Order & Helpers
// ===========================================

export const categoryOrder: AlgorithmCategory[] = [
  'SORTING',
  'SEARCHING',
  'GRAPH',
  'TREE',
  'LINEAR',
];

export function getCategoryDisplayName(category: AlgorithmCategory): string {
  const names: Record<AlgorithmCategory, string> = {
    SORTING: 'Sorting',
    SEARCHING: 'Searching',
    GRAPH: 'Graph',
    TREE: 'Tree',
    LINEAR: 'Linear',
  };
  return names[category];
}

export function getCategoryColor(category: AlgorithmCategory): string {
  const colors: Record<AlgorithmCategory, string> = {
    SORTING: 'bg-blue-100 text-blue-800',
    SEARCHING: 'bg-green-100 text-green-800',
    GRAPH: 'bg-purple-100 text-purple-800',
    TREE: 'bg-amber-100 text-amber-800',
    LINEAR: 'bg-rose-100 text-rose-800',
  };
  return colors[category];
}

// ===========================================
// Query Functions
// ===========================================

export function getAllAlgorithms(): AlgorithmMetadata[] {
  return algorithms;
}

export function getAlgorithmBySlug(slug: string): AlgorithmMetadata | undefined {
  return algorithms.find((algo) => algo.slug === slug);
}

export function getAlgorithmsByCategory(category: AlgorithmCategory): AlgorithmMetadata[] {
  return algorithms.filter((algo) => algo.category === category);
}

export function getAlgorithmsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): AlgorithmMetadata[] {
  return algorithms.filter((algo) => algo.difficulty === difficulty);
}

export function getAlgorithmsGroupedByCategory(): Record<AlgorithmCategory, AlgorithmMetadata[]> {
  const grouped: Record<AlgorithmCategory, AlgorithmMetadata[]> = {
    SORTING: [],
    SEARCHING: [],
    GRAPH: [],
    TREE: [],
    LINEAR: [],
  };

  for (const algo of algorithms) {
    grouped[algo.category].push(algo);
  }

  return grouped;
}

// ===========================================
// Algorithm Slugs Type
// ===========================================

export type AlgorithmSlug = typeof algorithms[number]['slug'];

// ===========================================
// Default Export
// ===========================================

export default algorithms;
