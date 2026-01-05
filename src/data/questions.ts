import { Question, TestType } from '@/types';

// ===========================================
// Questions Database
// ===========================================

export const questions: Question[] = [
  // Bubble Sort Questions
  {
    id: 'bubble-sort-1',
    algorithmSlug: 'bubble-sort',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What is the time complexity of Bubble Sort in the worst case?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    correctAnswer: 'O(n²)',
    explanation: 'Bubble Sort has O(n²) worst-case complexity because it uses nested loops to compare and swap adjacent elements.',
    points: 1,
    order: 1,
  },
  {
    id: 'bubble-sort-2',
    algorithmSlug: 'bubble-sort',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'Which of the following best describes how Bubble Sort works?',
    options: [
      'Divides the array and conquers',
      'Repeatedly swaps adjacent elements if they are in wrong order',
      'Selects the minimum element and places it at the beginning',
      'Inserts each element into its correct position',
    ],
    correctAnswer: 'Repeatedly swaps adjacent elements if they are in wrong order',
    explanation: 'Bubble Sort works by repeatedly stepping through the list, comparing adjacent elements, and swapping them if they are in the wrong order.',
    points: 1,
    order: 2,
  },
  {
    id: 'bubble-sort-3',
    algorithmSlug: 'bubble-sort',
    testType: 'PRE_TEST',
    type: 'FILL_BLANK',
    question: 'Bubble Sort is called a _____ sort because smaller elements "bubble" to the top.',
    correctAnswer: 'stable',
    explanation: 'Bubble Sort is a stable sorting algorithm, meaning equal elements maintain their relative order.',
    points: 1,
    order: 3,
  },
  {
    id: 'bubble-sort-4',
    algorithmSlug: 'bubble-sort',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What is the space complexity of Bubble Sort?',
    options: ['O(n)', 'O(n²)', 'O(1)', 'O(log n)'],
    correctAnswer: 'O(1)',
    explanation: 'Bubble Sort is an in-place algorithm that only needs a constant amount of extra space for the swap operation.',
    points: 1,
    order: 1,
  },
  {
    id: 'bubble-sort-5',
    algorithmSlug: 'bubble-sort',
    testType: 'POST_TEST',
    type: 'DRAG_DROP_ORDER',
    question: 'Arrange the steps of Bubble Sort in the correct order:',
    items: [
      'Compare adjacent elements',
      'Swap if left element is greater than right',
      'Move to the next pair',
      'Repeat until no swaps needed',
    ],
    correctOrder: [0, 1, 2, 3],
    explanation: 'Bubble Sort compares adjacent pairs, swaps if needed, moves to the next pair, and repeats until the array is sorted.',
    points: 2,
    order: 2,
  },

  // Selection Sort Questions
  {
    id: 'selection-sort-1',
    algorithmSlug: 'selection-sort',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What is the main idea behind Selection Sort?',
    options: [
      'Divide the array into two halves',
      'Find the minimum element and place it at the beginning',
      'Compare and swap adjacent elements',
      'Build the sorted array one element at a time by insertion',
    ],
    correctAnswer: 'Find the minimum element and place it at the beginning',
    explanation: 'Selection Sort works by repeatedly finding the minimum element from the unsorted portion and placing it at the beginning.',
    points: 1,
    order: 1,
  },
  {
    id: 'selection-sort-2',
    algorithmSlug: 'selection-sort',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'How many swaps does Selection Sort perform in the worst case for an array of n elements?',
    options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(1)'],
    correctAnswer: 'O(n)',
    explanation: 'Selection Sort performs at most n-1 swaps, one for each position in the array (except the last).',
    points: 1,
    order: 2,
  },
  {
    id: 'selection-sort-3',
    algorithmSlug: 'selection-sort',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'Is Selection Sort a stable sorting algorithm?',
    options: ['Yes', 'No'],
    correctAnswer: 'No',
    explanation: 'Selection Sort is not stable because it may change the relative order of equal elements during swapping.',
    points: 1,
    order: 1,
  },

  // Binary Search Questions
  {
    id: 'binary-search-1',
    algorithmSlug: 'binary-search',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What is a prerequisite for Binary Search to work correctly?',
    options: [
      'The array must be unsorted',
      'The array must be sorted',
      'The array must have unique elements',
      'The array must have an even number of elements',
    ],
    correctAnswer: 'The array must be sorted',
    explanation: 'Binary Search requires a sorted array because it relies on comparing the target with the middle element to eliminate half of the remaining elements.',
    points: 1,
    order: 1,
  },
  {
    id: 'binary-search-2',
    algorithmSlug: 'binary-search',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What is the time complexity of Binary Search?',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
    correctAnswer: 'O(log n)',
    explanation: 'Binary Search has O(log n) complexity because it halves the search space with each comparison.',
    points: 1,
    order: 2,
  },
  {
    id: 'binary-search-3',
    algorithmSlug: 'binary-search',
    testType: 'POST_TEST',
    type: 'FILL_BLANK',
    question: 'In Binary Search, we compare the target with the _____ element of the current range.',
    correctAnswer: 'middle',
    explanation: 'Binary Search always compares the target with the middle element to decide which half to search next.',
    points: 1,
    order: 1,
  },

  // Linear Search Questions
  {
    id: 'linear-search-1',
    algorithmSlug: 'linear-search',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What is the time complexity of Linear Search in the worst case?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctAnswer: 'O(n)',
    explanation: 'In the worst case, Linear Search must check every element in the array, resulting in O(n) complexity.',
    points: 1,
    order: 1,
  },
  {
    id: 'linear-search-2',
    algorithmSlug: 'linear-search',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'When is Linear Search preferred over Binary Search?',
    options: [
      'When the array is sorted',
      'When the array is unsorted',
      'When the array is very large',
      'Never',
    ],
    correctAnswer: 'When the array is unsorted',
    explanation: 'Linear Search can work on unsorted arrays, while Binary Search requires a sorted array.',
    points: 1,
    order: 1,
  },

  // BFS Questions
  {
    id: 'bfs-1',
    algorithmSlug: 'bfs',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What data structure does BFS use?',
    options: ['Stack', 'Queue', 'Heap', 'Tree'],
    correctAnswer: 'Queue',
    explanation: 'BFS uses a queue to maintain the order of vertices to visit, ensuring level-by-level traversal.',
    points: 1,
    order: 1,
  },
  {
    id: 'bfs-2',
    algorithmSlug: 'bfs',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What type of traversal does BFS perform?',
    options: ['Depth-first', 'Level-order', 'Random', 'Reverse'],
    correctAnswer: 'Level-order',
    explanation: 'BFS explores all vertices at the current depth before moving to vertices at the next depth level.',
    points: 1,
    order: 2,
  },
  {
    id: 'bfs-3',
    algorithmSlug: 'bfs',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'BFS can find the shortest path in which type of graph?',
    options: ['Weighted graph', 'Unweighted graph', 'Both', 'Neither'],
    correctAnswer: 'Unweighted graph',
    explanation: 'BFS finds the shortest path in unweighted graphs because it explores vertices level by level.',
    points: 1,
    order: 1,
  },

  // DFS Questions
  {
    id: 'dfs-1',
    algorithmSlug: 'dfs',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What data structure does DFS typically use (iterative implementation)?',
    options: ['Queue', 'Stack', 'Heap', 'Array'],
    correctAnswer: 'Stack',
    explanation: 'DFS uses a stack (or recursion, which uses the call stack) to keep track of vertices to visit.',
    points: 1,
    order: 1,
  },
  {
    id: 'dfs-2',
    algorithmSlug: 'dfs',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'Which of the following is a common application of DFS?',
    options: [
      'Finding shortest path in unweighted graph',
      'Detecting cycles in a graph',
      'Level-order traversal',
      'Finding minimum spanning tree',
    ],
    correctAnswer: 'Detecting cycles in a graph',
    explanation: 'DFS is commonly used for cycle detection, topological sorting, and finding connected components.',
    points: 1,
    order: 1,
  },

  // Merge Sort Questions
  {
    id: 'merge-sort-1',
    algorithmSlug: 'merge-sort',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What algorithmic paradigm does Merge Sort use?',
    options: ['Greedy', 'Dynamic Programming', 'Divide and Conquer', 'Backtracking'],
    correctAnswer: 'Divide and Conquer',
    explanation: 'Merge Sort divides the array into halves, sorts them recursively, and then merges the sorted halves.',
    points: 1,
    order: 1,
  },
  {
    id: 'merge-sort-2',
    algorithmSlug: 'merge-sort',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What is the time complexity of Merge Sort?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    correctAnswer: 'O(n log n)',
    explanation: 'Merge Sort always has O(n log n) complexity, regardless of the input order.',
    points: 1,
    order: 2,
  },
  {
    id: 'merge-sort-3',
    algorithmSlug: 'merge-sort',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What is the space complexity of Merge Sort?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctAnswer: 'O(n)',
    explanation: 'Merge Sort requires O(n) additional space for the temporary arrays during merging.',
    points: 1,
    order: 1,
  },

  // Insertion Sort Questions
  {
    id: 'insertion-sort-1',
    algorithmSlug: 'insertion-sort',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'What is the best-case time complexity of Insertion Sort?',
    options: ['O(1)', 'O(n)', 'O(n log n)', 'O(n²)'],
    correctAnswer: 'O(n)',
    explanation: 'When the array is already sorted, Insertion Sort only makes n-1 comparisons with no shifts.',
    points: 1,
    order: 1,
  },
  {
    id: 'insertion-sort-2',
    algorithmSlug: 'insertion-sort',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    question: 'Insertion Sort is most efficient for:',
    options: [
      'Large random arrays',
      'Small or nearly sorted arrays',
      'Reverse sorted arrays',
      'Arrays with unique elements',
    ],
    correctAnswer: 'Small or nearly sorted arrays',
    explanation: 'Insertion Sort performs well on small datasets and nearly sorted arrays due to minimal shifts needed.',
    points: 1,
    order: 1,
  },
];

// ===========================================
// Query Functions
// ===========================================

export function getQuestionsByAlgorithm(algorithmSlug: string): Question[] {
  return questions.filter((q) => q.algorithmSlug === algorithmSlug);
}

export function getQuestionsByAlgorithmAndType(
  algorithmSlug: string,
  testType: TestType
): Question[] {
  return questions.filter(
    (q) => q.algorithmSlug === algorithmSlug && q.testType === testType
  );
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

// ===========================================
// Default Export
// ===========================================

export default questions;
