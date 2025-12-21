import { Question, QuestionType, TestType, AlgorithmSlug } from '@/types';

// ===========================================
// Sample Questions for Development/Testing
// These mirror the database seed data
// ===========================================

export const sampleQuestions: Question[] = [
  // Bubble Sort - Pre Test
  {
    id: 'bs-pre-1',
    algorithmSlug: 'bubble-sort',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'What is the main operation in Bubble Sort?',
    options: [
      { id: 'a', text: 'Finding the minimum element' },
      { id: 'b', text: 'Comparing and swapping adjacent elements' },
      { id: 'c', text: 'Dividing the array into halves' },
      { id: 'd', text: 'Inserting elements at correct position' },
    ],
    correctAnswer: 'b',
    explanation: 'Bubble Sort works by repeatedly comparing adjacent elements and swapping them if they are in the wrong order.',
    points: 1,
    order: 1,
  },
  {
    id: 'bs-pre-2',
    algorithmSlug: 'bubble-sort',
    testType: 'PRE_TEST',
    type: 'TRUE_FALSE',
    questionText: 'Bubble Sort is a stable sorting algorithm.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctAnswer: true,
    explanation: 'Bubble Sort is stable because it only swaps adjacent elements when the left element is greater.',
    points: 1,
    order: 2,
  },
  {
    id: 'bs-pre-3',
    algorithmSlug: 'bubble-sort',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'What is the worst-case time complexity of Bubble Sort?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(n log n)' },
      { id: 'c', text: 'O(n²)' },
      { id: 'd', text: 'O(log n)' },
    ],
    correctAnswer: 'c',
    explanation: 'Bubble Sort has O(n²) worst-case time complexity because it uses nested loops.',
    points: 1,
    order: 3,
  },

  // Bubble Sort - Post Test
  {
    id: 'bs-post-1',
    algorithmSlug: 'bubble-sort',
    testType: 'POST_TEST',
    type: 'DRAG_DROP_ORDER',
    questionText: 'Arrange these steps of Bubble Sort in the correct order:',
    options: [
      { id: 'step1', text: 'Compare adjacent elements' },
      { id: 'step2', text: 'Swap if left > right' },
      { id: 'step3', text: 'Move to next pair' },
      { id: 'step4', text: 'Repeat until no swaps needed' },
    ],
    correctAnswer: ['step1', 'step2', 'step3', 'step4'],
    explanation: 'Bubble Sort compares adjacent elements, swaps if needed, moves to the next pair, and repeats until sorted.',
    points: 2,
    order: 1,
  },
  {
    id: 'bs-post-2',
    algorithmSlug: 'bubble-sort',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'After the first complete pass of Bubble Sort on [5, 3, 8, 1, 9], which element is in its final position?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '5' },
      { id: 'c', text: '9' },
      { id: 'd', text: '3' },
    ],
    correctAnswer: 'c',
    explanation: 'After the first pass, the largest element (9) "bubbles up" to its final position at the end.',
    points: 1,
    order: 2,
  },
  {
    id: 'bs-post-3',
    algorithmSlug: 'bubble-sort',
    testType: 'POST_TEST',
    type: 'FILL_BLANK',
    questionText: 'The space complexity of Bubble Sort is O(_____) because it sorts in-place.',
    options: null,
    correctAnswer: '1',
    explanation: 'Bubble Sort only uses a constant amount of extra space for the swap operation.',
    points: 1,
    order: 3,
  },

  // Binary Search - Pre Test
  {
    id: 'bsearch-pre-1',
    algorithmSlug: 'binary-search',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'What is a prerequisite for Binary Search to work correctly?',
    options: [
      { id: 'a', text: 'Array must be unsorted' },
      { id: 'b', text: 'Array must be sorted' },
      { id: 'c', text: 'Array must have unique elements' },
      { id: 'd', text: 'Array must be of odd length' },
    ],
    correctAnswer: 'b',
    explanation: 'Binary Search requires the array to be sorted to work correctly.',
    points: 1,
    order: 1,
  },
  {
    id: 'bsearch-pre-2',
    algorithmSlug: 'binary-search',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'What is the time complexity of Binary Search?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(n²)' },
      { id: 'c', text: 'O(log n)' },
      { id: 'd', text: 'O(1)' },
    ],
    correctAnswer: 'c',
    explanation: 'Binary Search has O(log n) time complexity because it halves the search space each iteration.',
    points: 1,
    order: 2,
  },
  {
    id: 'bsearch-pre-3',
    algorithmSlug: 'binary-search',
    testType: 'PRE_TEST',
    type: 'TRUE_FALSE',
    questionText: 'Binary Search can be used on unsorted arrays.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctAnswer: false,
    explanation: 'Binary Search only works on sorted arrays because it relies on the ordering to eliminate half the elements.',
    points: 1,
    order: 3,
  },

  // Binary Search - Post Test
  {
    id: 'bsearch-post-1',
    algorithmSlug: 'binary-search',
    testType: 'POST_TEST',
    type: 'DRAG_DROP_ORDER',
    questionText: 'Arrange the Binary Search steps in correct order:',
    options: [
      { id: 'step1', text: 'Calculate middle index' },
      { id: 'step2', text: 'Compare target with middle element' },
      { id: 'step3', text: 'Narrow search to left or right half' },
      { id: 'step4', text: 'Return index if found or -1 if not' },
    ],
    correctAnswer: ['step1', 'step2', 'step3', 'step4'],
    explanation: 'Binary Search calculates middle, compares, narrows range, and continues until found or exhausted.',
    points: 2,
    order: 1,
  },
  {
    id: 'bsearch-post-2',
    algorithmSlug: 'binary-search',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'If target < middle element, which half do we search next?',
    options: [
      { id: 'a', text: 'Right half' },
      { id: 'b', text: 'Left half' },
      { id: 'c', text: 'Both halves' },
      { id: 'd', text: 'Neither' },
    ],
    correctAnswer: 'b',
    explanation: 'When target is less than middle, we search the left half where smaller elements are.',
    points: 1,
    order: 2,
  },
  {
    id: 'bsearch-post-3',
    algorithmSlug: 'binary-search',
    testType: 'POST_TEST',
    type: 'FILL_BLANK',
    questionText: 'In the worst case, Binary Search makes _____ comparisons for an array of 1024 elements.',
    options: null,
    correctAnswer: '10',
    explanation: 'log₂(1024) = 10, so Binary Search makes at most 10 comparisons.',
    points: 1,
    order: 3,
  },

  // BFS - Pre Test
  {
    id: 'bfs-pre-1',
    algorithmSlug: 'bfs',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'What data structure does BFS use?',
    options: [
      { id: 'a', text: 'Stack' },
      { id: 'b', text: 'Queue' },
      { id: 'c', text: 'Heap' },
      { id: 'd', text: 'Tree' },
    ],
    correctAnswer: 'b',
    explanation: 'BFS uses a Queue to process nodes level by level (FIFO order).',
    points: 1,
    order: 1,
  },
  {
    id: 'bfs-pre-2',
    algorithmSlug: 'bfs',
    testType: 'PRE_TEST',
    type: 'TRUE_FALSE',
    questionText: 'BFS explores nodes closest to the source before moving to farther nodes.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctAnswer: true,
    explanation: 'BFS explores nodes level by level, starting from the closest.',
    points: 1,
    order: 2,
  },

  // BFS - Post Test
  {
    id: 'bfs-post-1',
    algorithmSlug: 'bfs',
    testType: 'POST_TEST',
    type: 'DRAG_DROP_ORDER',
    questionText: 'Arrange the BFS algorithm steps in order:',
    options: [
      { id: 'step1', text: 'Start at source node, add to queue' },
      { id: 'step2', text: 'Dequeue front node' },
      { id: 'step3', text: 'Visit unvisited neighbors, add to queue' },
      { id: 'step4', text: 'Repeat until queue is empty' },
    ],
    correctAnswer: ['step1', 'step2', 'step3', 'step4'],
    explanation: 'BFS starts at source, processes queue front, adds neighbors, and repeats.',
    points: 2,
    order: 1,
  },
  {
    id: 'bfs-post-2',
    algorithmSlug: 'bfs',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'BFS is guaranteed to find the shortest path in:',
    options: [
      { id: 'a', text: 'Weighted graphs' },
      { id: 'b', text: 'Unweighted graphs' },
      { id: 'c', text: 'All graphs' },
      { id: 'd', text: 'No graphs' },
    ],
    correctAnswer: 'b',
    explanation: 'BFS finds shortest path in unweighted graphs where all edges have equal cost.',
    points: 1,
    order: 2,
  },

  // DFS - Pre Test
  {
    id: 'dfs-pre-1',
    algorithmSlug: 'dfs',
    testType: 'PRE_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'What data structure does DFS use (iterative version)?',
    options: [
      { id: 'a', text: 'Queue' },
      { id: 'b', text: 'Stack' },
      { id: 'c', text: 'Heap' },
      { id: 'd', text: 'Array' },
    ],
    correctAnswer: 'b',
    explanation: 'DFS uses a Stack to explore as deep as possible before backtracking.',
    points: 1,
    order: 1,
  },
  {
    id: 'dfs-pre-2',
    algorithmSlug: 'dfs',
    testType: 'PRE_TEST',
    type: 'TRUE_FALSE',
    questionText: 'DFS explores as deep as possible before backtracking.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctAnswer: true,
    explanation: 'DFS goes deep into one path before exploring other branches.',
    points: 1,
    order: 2,
  },

  // DFS - Post Test
  {
    id: 'dfs-post-1',
    algorithmSlug: 'dfs',
    testType: 'POST_TEST',
    type: 'MULTIPLE_CHOICE',
    questionText: 'Which traversal order visits nodes in DFS?',
    options: [
      { id: 'a', text: 'Level by level' },
      { id: 'b', text: 'Depth-first, then backtrack' },
      { id: 'c', text: 'Random order' },
      { id: 'd', text: 'Alphabetical order' },
    ],
    correctAnswer: 'b',
    explanation: 'DFS explores deep into a branch before backtracking to explore other branches.',
    points: 1,
    order: 1,
  },
  {
    id: 'dfs-post-2',
    algorithmSlug: 'dfs',
    testType: 'POST_TEST',
    type: 'TRUE_FALSE',
    questionText: 'DFS always finds the shortest path.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctAnswer: false,
    explanation: 'DFS does not guarantee shortest path; it finds A path, not necessarily the shortest.',
    points: 1,
    order: 2,
  },
];

// ===========================================
// Helper Functions
// ===========================================

/**
 * Get all questions for an algorithm
 */
export function getQuestionsByAlgorithm(algorithmSlug: AlgorithmSlug): Question[] {
  return sampleQuestions.filter((q) => q.algorithmSlug === algorithmSlug);
}

/**
 * Get questions by algorithm and test type
 */
export function getQuestionsByAlgorithmAndType(
  algorithmSlug: AlgorithmSlug,
  testType: TestType
): Question[] {
  return sampleQuestions.filter(
    (q) => q.algorithmSlug === algorithmSlug && q.testType === testType
  );
}

/**
 * Get pre-test questions for an algorithm
 */
export function getPreTestQuestions(algorithmSlug: AlgorithmSlug): Question[] {
  return getQuestionsByAlgorithmAndType(algorithmSlug, 'PRE_TEST');
}

/**
 * Get post-test questions for an algorithm
 */
export function getPostTestQuestions(algorithmSlug: AlgorithmSlug): Question[] {
  return getQuestionsByAlgorithmAndType(algorithmSlug, 'POST_TEST');
}

