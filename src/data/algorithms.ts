import { AlgorithmMetadata, AlgorithmCategory } from '@/types';

export const algorithms: AlgorithmMetadata[] = [
  // ===========================================
  // Sorting Algorithms
  // ===========================================
  {
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'SORTING',
    description:
      'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    stable: true,
    useCases: [
      'Educational purposes',
      'Small datasets',
      'Nearly sorted data (with optimization)',
    ],
  },
  {
    slug: 'selection-sort',
    name: 'Selection Sort',
    category: 'SORTING',
    description:
      'Divides the array into sorted and unsorted regions, repeatedly finding the minimum from unsorted and moving it to sorted.',
    timeComplexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    stable: false,
    useCases: [
      'Small datasets',
      'When memory writes are expensive',
      'Simple implementation needs',
    ],
  },
  {
    slug: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'SORTING',
    description:
      'Builds the sorted array one element at a time by inserting each element into its correct position.',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    stable: true,
    useCases: [
      'Small datasets',
      'Nearly sorted data',
      'Online sorting (streaming data)',
    ],
  },
  {
    slug: 'merge-sort',
    name: 'Merge Sort',
    category: 'SORTING',
    description:
      'Divides the array into halves, recursively sorts them, and then merges the sorted halves.',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n)',
    stable: true,
    useCases: [
      'Large datasets',
      'Linked lists',
      'External sorting',
      'When stability is required',
    ],
  },

  // ===========================================
  // Searching Algorithms
  // ===========================================
  {
    slug: 'linear-search',
    name: 'Linear Search',
    category: 'SEARCHING',
    description:
      'Sequentially checks each element until a match is found or the end is reached.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(1)',
    useCases: [
      'Unsorted arrays',
      'Small datasets',
      'When data is not indexed',
      'Single search operations',
    ],
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    category: 'SEARCHING',
    description:
      'Efficiently finds a target in a sorted array by repeatedly dividing the search interval in half.',
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
      'Finding boundaries',
    ],
  },

  // ===========================================
  // Graph Algorithms
  // ===========================================
  {
    slug: 'bfs',
    name: 'Breadth-First Search',
    category: 'GRAPH',
    description:
      'Explores all vertices at the present depth before moving to vertices at the next depth level.',
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
    description:
      'Explores as far as possible along each branch before backtracking.',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    spaceComplexity: 'O(V)',
    useCases: [
      'Topological sorting',
      'Cycle detection',
      'Path finding',
      'Maze solving',
    ],
  },
  {
    slug: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'GRAPH',
    description:
      'Finds the shortest paths from a source vertex to all other vertices in a weighted graph with non-negative weights.',
    timeComplexity: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
    },
    spaceComplexity: 'O(V)',
    useCases: [
      'GPS navigation',
      'Network routing',
      'Shortest path with positive weights',
    ],
  },
  {
    slug: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    category: 'GRAPH',
    description:
      'Finds shortest paths from a source vertex, handling negative edge weights and detecting negative cycles.',
    timeComplexity: {
      best: 'O(V × E)',
      average: 'O(V × E)',
      worst: 'O(V × E)',
    },
    spaceComplexity: 'O(V)',
    useCases: [
      'Graphs with negative weights',
      'Detecting negative cycles',
      'Currency arbitrage detection',
    ],
  },
  {
    slug: 'prims',
    name: "Prim's Algorithm",
    category: 'GRAPH',
    description:
      'Finds a minimum spanning tree by starting from a vertex and greedily adding the cheapest edge.',
    timeComplexity: {
      best: 'O(E log V)',
      average: 'O(E log V)',
      worst: 'O(E log V)',
    },
    spaceComplexity: 'O(V)',
    useCases: [
      'Network design',
      'Clustering',
      'Dense graphs',
      'Approximation algorithms',
    ],
  },
  {
    slug: 'kruskals',
    name: "Kruskal's Algorithm",
    category: 'GRAPH',
    description:
      'Finds a minimum spanning tree by sorting edges and adding them if they don\'t create a cycle.',
    timeComplexity: {
      best: 'O(E log E)',
      average: 'O(E log E)',
      worst: 'O(E log E)',
    },
    spaceComplexity: 'O(V)',
    useCases: [
      'Network design',
      'Sparse graphs',
      'Edge-based processing',
    ],
  },

  // ===========================================
  // Tree Algorithms
  // ===========================================
  {
    slug: 'bst-operations',
    name: 'Binary Search Tree',
    category: 'TREE',
    description:
      'A binary tree where left subtree contains smaller values and right subtree contains larger values.',
    timeComplexity: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Dynamic sorted data',
      'Range queries',
      'Predecessor/successor queries',
    ],
  },
  {
    slug: 'avl-tree',
    name: 'AVL Tree',
    category: 'TREE',
    description:
      'A self-balancing BST where heights of subtrees differ by at most one.',
    timeComplexity: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Databases',
      'Memory management',
      'When frequent lookups are needed',
    ],
  },
  {
    slug: 'min-heap',
    name: 'Min Heap',
    category: 'TREE',
    description:
      'A complete binary tree where each node is smaller than its children.',
    timeComplexity: {
      best: 'O(1) extract-min',
      average: 'O(log n) insert',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Priority queues',
      'Heap sort',
      "Dijkstra's algorithm",
      'Median finding',
    ],
  },
  {
    slug: 'max-heap',
    name: 'Max Heap',
    category: 'TREE',
    description:
      'A complete binary tree where each node is larger than its children.',
    timeComplexity: {
      best: 'O(1) extract-max',
      average: 'O(log n) insert',
      worst: 'O(log n)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Priority queues',
      'Heap sort',
      'Finding k largest elements',
    ],
  },
  {
    slug: 'tree-traversals',
    name: 'Tree Traversals',
    category: 'TREE',
    description:
      'Methods to visit all nodes: Inorder, Preorder, Postorder, and Level-order.',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(h) where h is height',
    useCases: [
      'Expression evaluation',
      'Tree serialization',
      'Finding paths',
    ],
  },

  // ===========================================
  // Linear Data Structures
  // ===========================================
  {
    slug: 'singly-linked-list',
    name: 'Singly Linked List',
    category: 'LINEAR_STRUCTURE',
    description:
      'A sequence of nodes where each node points to the next node.',
    timeComplexity: {
      best: 'O(1) insert at head',
      average: 'O(n) search',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Dynamic size data',
      'Frequent insertions/deletions',
      'Stack implementation',
    ],
  },
  {
    slug: 'doubly-linked-list',
    name: 'Doubly Linked List',
    category: 'LINEAR_STRUCTURE',
    description:
      'A sequence of nodes where each node points to both next and previous nodes.',
    timeComplexity: {
      best: 'O(1) insert/delete at ends',
      average: 'O(n) search',
      worst: 'O(n)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Browser history',
      'LRU cache',
      'Deque implementation',
    ],
  },
  {
    slug: 'stack',
    name: 'Stack',
    category: 'LINEAR_STRUCTURE',
    description:
      'LIFO (Last In, First Out) data structure with push and pop operations.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'Undo operations',
      'Expression parsing',
      'Backtracking',
      'Function call stack',
    ],
  },
  {
    slug: 'queue',
    name: 'Queue',
    category: 'LINEAR_STRUCTURE',
    description:
      'FIFO (First In, First Out) data structure with enqueue and dequeue operations.',
    timeComplexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    spaceComplexity: 'O(n)',
    useCases: [
      'BFS implementation',
      'Task scheduling',
      'Print queues',
      'Message queues',
    ],
  },
];

// Helper functions
export function getAlgorithmBySlug(slug: string): AlgorithmMetadata | undefined {
  return algorithms.find((algo) => algo.slug === slug);
}

export function getAlgorithmsByCategory(
  category: AlgorithmCategory
): AlgorithmMetadata[] {
  return algorithms.filter((algo) => algo.category === category);
}

export function getCategoryDisplayName(category: AlgorithmCategory): string {
  const names: Record<AlgorithmCategory, string> = {
    SORTING: 'Sorting Algorithms',
    SEARCHING: 'Searching Algorithms',
    GRAPH: 'Graph Algorithms',
    TREE: 'Tree Structures',
    LINEAR_STRUCTURE: 'Linear Structures',
  };
  return names[category];
}

export function getCategoryColor(category: AlgorithmCategory): string {
  const colors: Record<AlgorithmCategory, string> = {
    SORTING: 'sorting',
    SEARCHING: 'searching',
    GRAPH: 'graph',
    TREE: 'tree',
    LINEAR_STRUCTURE: 'linear',
  };
  return colors[category];
}

export const categoryOrder: AlgorithmCategory[] = [
  'SORTING',
  'SEARCHING',
  'GRAPH',
  'TREE',
  'LINEAR_STRUCTURE',
];
