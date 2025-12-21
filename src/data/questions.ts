import { Question, QuestionType, TestType, AlgorithmSlug } from '@/types';

// ===========================================
// Sample Questions for Development/Testing
// These mirror the database seed data
// ===========================================

export const sampleQuestions: Partial<Question>[] = [
  // Bubble Sort - Pre Test
  {
    id: 'bs-pre-1',
    algorithmSlug: 'bubble-sort',
    testType: 'PRE_TEST',
    questionType: 'multiple-choice',
    questionText: 'What is the main operation in Bubble Sort?',
    options: [
      { id: 'a', text: 'Finding the minimum element' },
      { id: 'b', text: 'Comparing and swapping adjacent elements' },
      { id: 'c', text: 'Dividing the array into halves' },
      { id: 'd', text: 'Inserting elements at correct position' },
    ],
    correctAnswer: 'b',
    explanation: 'Bubble Sort works by repeatedly comparing adjacent elements and swapping them if they are in the wrong order.',
    order: 1,
  },
  {
    id: 'bs-pre-2',
    algorithmSlug: 'bubble-sort',
    testType: 'PRE_TEST',
    questionType: 'true-false',
    questionText: 'Bubble Sort is a stable sorting algorithm.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctAnswer: 'true',
    explanation: 'Bubble Sort is stable because it only swaps adjacent elements when the left element is greater.',
    order: 2,
  },
  {
    id: 'bs-pre-3',
    algorithmSlug: 'bubble-sort',
    testType: 'PRE_TEST',
    questionType: 'multiple-choice',
    questionText: 'What is the worst-case time complexity of Bubble Sort?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(n log n)' },
      { id: 'c', text: 'O(n²)' },
      { id: 'd', text: 'O(log n)' },
    ],
    correctAnswer: 'c',
    explanation: 'Bubble Sort has O(n²) worst-case time complexity.',
    order: 3,
  },

  // Bubble Sort - Post Test
  {
    id: 'bs-post-1',
    algorithmSlug: 'bubble-sort',
    testType: 'POST_TEST',
    questionType: 'drag-drop-order',
    questionText: 'Arrange these steps of Bubble Sort in the correct order:',
    options: [
      { id: 'step1', text: 'Compare adjacent elements' },
      { id: 'step2', text: 'Swap if left > right' },
      { id: 'step3', text: 'Move to next pair' },
      { id: 'step4', text: 'Repeat until no swaps needed' },
    ],
    correctAnswer: ['step1', 'step2', 'step3', 'step4'],
    explanation: 'Bubble Sort compares adjacent elements, swaps if needed, moves to the next pair, and repeats.',
    order: 1,
  },
  {
    id: 'bs-post-2',
    algorithmSlug: 'bubble-sort',
    testType: 'POST_TEST',
    questionType: 'multiple-choice',
    questionText: 'After the first complete pass of Bubble Sort on [5, 3, 8, 1, 9], which element is in its final position?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '5' },
      { id: 'c', text: '9' },
      { id: 'd', text: '3' },
    ],
    correctAnswer: 'c',
    explanation: 'After the first pass, the largest element (9) "bubbles up" to its final position.',
    order: 2,
  },
  {
    id: 'bs-post-3',
    algorithmSlug: 'bubble-sort',
    testType: 'POST_TEST',
    questionType: 'fill-blank',
    questionText: 'The space complexity of Bubble Sort is O(___) because it sorts in-place.',
    options: null,
    correctAnswer: '1',
    explanation: 'Bubble Sort only uses a constant amount of extra space.',
    order: 3,
  },

  // Binary Search - Pre Test
  {
    id: 'bsearch-pre-1',
    algorithmSlug: 'binary-search',
    testType: 'PRE_TEST',
    questionType: 'multiple-choice',
    questionText: 'What is a prerequisite for Binary Search to work correctly?',
    options: [
      { id: 'a', text: 'Array must be unsorted' },
      { id: 'b', text: 'Array must be sorted' },
      { id: 'c', text: 'Array must have unique elements' },
      { id: 'd', text: 'Array must be of odd length' },
    ],
    correctAnswer: 'b',
    explanation: 'Binary Search requires the array to be sorted.',
    order: 1,
  },
  {
    id: 'bsearch-pre-2',
    algorithmSlug: 'binary-search',
    testType: 'PRE_TEST',
    questionType: 'multiple-choice',
    questionText: 'What is the time complexity of Binary Search?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(n²)' },
      { id: 'c', text: 'O(log n)' },
      { id: 'd', text: 'O(1)' },
    ],
    correctAnswer: 'c',
    explanation: 'Binary Search has O(log n) time complexity.',
    order: 2,
  },

  // Binary Search - Post Test
  {
    id: 'bsearch-post-1',
    algorithmSlug: 'binary-search',
    testType: 'POST_TEST',
    questionType: 'drag-drop-order',
    questionText: 'Arrange the Binary Search steps in correct order:',
    options: [
      { id: 'step1', text: 'Calculate middle index' },
      { id: 'step2', text: 'Compare target with middle element' },
      { id: 'step3', text: 'Narrow search to left or right half' },
      { id: 'step4', text: 'Return index if found or -1 if not' },
    ],
    correctAnswer: ['step1', 'step2', 'step3', 'step4'],
    explanation: 'Binary Search calculates middle, compares, narrows range, and continues.',
    order: 1,
  },
  {
    id: 'bsearch-post-2',
    algorithmSlug: 'binary-search',
    testType: 'POST_TEST',
    questionType: 'multiple-choice',
    questionText: 'If target < middle element, which half do we search next?',
    options: [
      { id: 'a', text: 'Right half' },
      { id: 'b', text: 'Left half' },
      { id: 'c', text: 'Both halves' },
      { id: 'd', text: 'Neither' },
    ],
    correctAnswer: 'b',
    explanation: 'When target is less than middle, we search the left half.',
    order: 2,
  },

  // Stack - Pre Test
  {
    id: 'stack-pre-1',
    algorithmSlug: 'stack',
    testType: 'PRE_TEST',
    questionType: 'multiple-choice',
    questionText: 'What principle does a Stack follow?',
    options: [
      { id: 'a', text: 'FIFO (First In, First Out)' },
      { id: 'b', text: 'LIFO (Last In, First Out)' },
      { id: 'c', text: 'Random Access' },
      { id: 'd', text: 'Priority Based' },
    ],
    correctAnswer: 'b',
    explanation: 'Stack follows LIFO - the last element added is first removed.',
    order: 1,
  },
  {
    id: 'stack-pre-2',
    algorithmSlug: 'stack',
    testType: 'PRE_TEST',
    questionType: 'multiple-choice',
    questionText: 'Which operation adds an element to a Stack?',
    options: [
      { id: 'a', text: 'Enqueue' },
      { id: 'b', text: 'Push' },
      { id: 'c', text: 'Insert' },
      { id: 'd', text: 'Add' },
    ],
    correctAnswer: 'b',
    explanation: 'Push adds an element to the top of a Stack.',
    order: 2,
  },

  // Stack - Post Test
  {
    id: 'stack-post-1',
    algorithmSlug: 'stack',
    testType: 'POST_TEST',
    questionType: 'drag-drop-match',
    questionText: 'Match each Stack operation with its description:',
    options: [
      { id: 'push', text: 'Push' },
      { id: 'pop', text: 'Pop' },
      { id: 'peek', text: 'Peek' },
      { id: 'isEmpty', text: 'isEmpty' },
    ],
    correctAnswer: {
      push: 'Add element to top',
      pop: 'Remove element from top',
      peek: 'View top element without removing',
      isEmpty: 'Check if stack has no elements',
    },
    explanation: 'These are the four fundamental Stack operations.',
    order: 1,
  },
  {
    id: 'stack-post-2',
    algorithmSlug: 'stack',
    testType: 'POST_TEST',
    questionType: 'multiple-choice',
    questionText: 'What is the time complexity of Push and Pop operations?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(log n)' },
      { id: 'c', text: 'O(1)' },
      { id: 'd', text: 'O(n²)' },
    ],
    correctAnswer: 'c',
    explanation: 'Both Push and Pop are O(1) as they only operate on the top.',
    order: 2,
  },
];

// Helper to get questions by algorithm and test type
export function getQuestionsByAlgorithmAndType(
  algorithmSlug: AlgorithmSlug,
  testType: TestType
): Partial<Question>[] {
  return sampleQuestions.filter(
    (q) => q.algorithmSlug === algorithmSlug && q.testType === testType
  );
}

// Match options for drag-drop-match questions
export const matchOptions: Record<string, string[]> = {
  'stack-post-1': [
    'Add element to top',
    'Remove element from top',
    'View top element without removing',
    'Check if stack has no elements',
  ],
};
