import { PrismaClient, AlgorithmCategory, TestType, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

// ===========================================
// Algorithm Data
// ===========================================

const algorithmsData = [
  // Sorting
  {
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    useCases: ['Educational purposes', 'Small datasets', 'Nearly sorted data'],
  },
  {
    slug: 'selection-sort',
    name: 'Selection Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Divides the array into sorted and unsorted regions, repeatedly finding the minimum from unsorted and moving it to sorted.',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: false,
    useCases: ['Small datasets', 'When memory writes are expensive'],
  },
  {
    slug: 'insertion-sort',
    name: 'Insertion Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Builds the sorted array one element at a time by inserting each element into its correct position.',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    useCases: ['Small datasets', 'Nearly sorted data', 'Online sorting'],
  },
  {
    slug: 'merge-sort',
    name: 'Merge Sort',
    category: AlgorithmCategory.SORTING,
    description: 'Divides the array into halves, recursively sorts them, and then merges the sorted halves.',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    useCases: ['Large datasets', 'Linked lists', 'External sorting'],
  },
  // Searching
  {
    slug: 'linear-search',
    name: 'Linear Search',
    category: AlgorithmCategory.SEARCHING,
    description: 'Sequentially checks each element until a match is found or the end is reached.',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    stable: null,
    useCases: ['Unsorted arrays', 'Small datasets'],
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    category: AlgorithmCategory.SEARCHING,
    description: 'Efficiently finds a target in a sorted array by repeatedly dividing the search interval in half.',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    stable: null,
    useCases: ['Sorted arrays', 'Large datasets', 'Frequent searches'],
  },
  // Graph
  {
    slug: 'bfs',
    name: 'Breadth-First Search',
    category: AlgorithmCategory.GRAPH,
    description: 'Explores all vertices at the present depth before moving to vertices at the next depth level.',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
    stable: null,
    useCases: ['Shortest path in unweighted graphs', 'Level-order traversal'],
  },
  {
    slug: 'dfs',
    name: 'Depth-First Search',
    category: AlgorithmCategory.GRAPH,
    description: 'Explores as far as possible along each branch before backtracking.',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
    stable: null,
    useCases: ['Topological sorting', 'Cycle detection', 'Path finding'],
  },
  {
    slug: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: AlgorithmCategory.GRAPH,
    description: 'Finds the shortest paths from a source vertex to all other vertices in a weighted graph.',
    timeComplexity: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
    spaceComplexity: 'O(V)',
    stable: null,
    useCases: ['GPS navigation', 'Network routing'],
  },
  // Tree
  {
    slug: 'bst-operations',
    name: 'Binary Search Tree',
    category: AlgorithmCategory.TREE,
    description: 'A binary tree where left subtree contains smaller values and right subtree contains larger values.',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: null,
    useCases: ['Dynamic sorted data', 'Range queries'],
  },
  {
    slug: 'min-heap',
    name: 'Min Heap',
    category: AlgorithmCategory.TREE,
    description: 'A complete binary tree where each node is smaller than its children.',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    stable: null,
    useCases: ['Priority queues', 'Heap sort', "Dijkstra's algorithm"],
  },
  // Linear
  {
    slug: 'singly-linked-list',
    name: 'Singly Linked List',
    category: AlgorithmCategory.LINEAR_STRUCTURE,
    description: 'A sequence of nodes where each node points to the next node.',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: null,
    useCases: ['Dynamic size data', 'Frequent insertions/deletions'],
  },
  {
    slug: 'stack',
    name: 'Stack',
    category: AlgorithmCategory.LINEAR_STRUCTURE,
    description: 'LIFO (Last In, First Out) data structure with push and pop operations.',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(n)',
    stable: null,
    useCases: ['Undo operations', 'Expression parsing', 'Backtracking'],
  },
  {
    slug: 'queue',
    name: 'Queue',
    category: AlgorithmCategory.LINEAR_STRUCTURE,
    description: 'FIFO (First In, First Out) data structure with enqueue and dequeue operations.',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(n)',
    stable: null,
    useCases: ['BFS implementation', 'Task scheduling'],
  },
];

// ===========================================
// Questions Data
// ===========================================

interface QuestionData {
  algorithmSlug: string;
  testType: TestType;
  questionType: QuestionType;
  questionText: string;
  options: { id: string; text: string; isCode?: boolean }[] | null;
  correctAnswer: string | string[] | Record<string, string>;
  explanation: string;
  order: number;
  points: number;
}

const questionsData: QuestionData[] = [
  // ===========================================
  // Bubble Sort Questions
  // ===========================================
  // Pre-test
  {
    algorithmSlug: 'bubble-sort',
    testType: TestType.PRE_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
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
    points: 1,
  },
  {
    algorithmSlug: 'bubble-sort',
    testType: TestType.PRE_TEST,
    questionType: QuestionType.TRUE_FALSE,
    questionText: 'Bubble Sort is a stable sorting algorithm.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctAnswer: 'true',
    explanation: 'Bubble Sort is stable because it only swaps adjacent elements when the left element is greater than the right element, preserving the relative order of equal elements.',
    order: 2,
    points: 1,
  },
  {
    algorithmSlug: 'bubble-sort',
    testType: TestType.PRE_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'What is the worst-case time complexity of Bubble Sort?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(n log n)' },
      { id: 'c', text: 'O(n²)' },
      { id: 'd', text: 'O(log n)' },
    ],
    correctAnswer: 'c',
    explanation: 'Bubble Sort has O(n²) worst-case time complexity because it may need to make n passes through the array, each comparing up to n elements.',
    order: 3,
    points: 1,
  },
  // Post-test
  {
    algorithmSlug: 'bubble-sort',
    testType: TestType.POST_TEST,
    questionType: QuestionType.DRAG_DROP_ORDER,
    questionText: 'Arrange these steps of Bubble Sort in the correct order:',
    options: [
      { id: 'step1', text: 'Compare adjacent elements' },
      { id: 'step2', text: 'Swap if left > right' },
      { id: 'step3', text: 'Move to next pair' },
      { id: 'step4', text: 'Repeat until no swaps needed' },
    ],
    correctAnswer: ['step1', 'step2', 'step3', 'step4'],
    explanation: 'Bubble Sort compares adjacent elements, swaps if needed, moves to the next pair, and repeats until the array is sorted.',
    order: 1,
    points: 2,
  },
  {
    algorithmSlug: 'bubble-sort',
    testType: TestType.POST_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'After the first complete pass of Bubble Sort on [5, 3, 8, 1, 9], which element is in its final position?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '5' },
      { id: 'c', text: '9' },
      { id: 'd', text: '3' },
    ],
    correctAnswer: 'c',
    explanation: 'After the first pass of Bubble Sort, the largest element (9) "bubbles up" to its final position at the end of the array.',
    order: 2,
    points: 1,
  },
  {
    algorithmSlug: 'bubble-sort',
    testType: TestType.POST_TEST,
    questionType: QuestionType.FILL_BLANK,
    questionText: 'The space complexity of Bubble Sort is O(___) because it sorts in-place.',
    options: null,
    correctAnswer: '1',
    explanation: 'Bubble Sort only uses a constant amount of extra space for the swap operation, making its space complexity O(1).',
    order: 3,
    points: 1,
  },

  // ===========================================
  // Binary Search Questions
  // ===========================================
  // Pre-test
  {
    algorithmSlug: 'binary-search',
    testType: TestType.PRE_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'What is a prerequisite for Binary Search to work correctly?',
    options: [
      { id: 'a', text: 'Array must be unsorted' },
      { id: 'b', text: 'Array must be sorted' },
      { id: 'c', text: 'Array must have unique elements' },
      { id: 'd', text: 'Array must be of odd length' },
    ],
    correctAnswer: 'b',
    explanation: 'Binary Search requires the array to be sorted to work correctly, as it relies on comparing the target with the middle element to eliminate half of the remaining elements.',
    order: 1,
    points: 1,
  },
  {
    algorithmSlug: 'binary-search',
    testType: TestType.PRE_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'What is the time complexity of Binary Search?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(n²)' },
      { id: 'c', text: 'O(log n)' },
      { id: 'd', text: 'O(1)' },
    ],
    correctAnswer: 'c',
    explanation: 'Binary Search has O(log n) time complexity because it eliminates half of the remaining elements in each step.',
    order: 2,
    points: 1,
  },
  // Post-test
  {
    algorithmSlug: 'binary-search',
    testType: TestType.POST_TEST,
    questionType: QuestionType.DRAG_DROP_ORDER,
    questionText: 'Arrange the Binary Search steps in correct order:',
    options: [
      { id: 'step1', text: 'Calculate middle index' },
      { id: 'step2', text: 'Compare target with middle element' },
      { id: 'step3', text: 'Narrow search to left or right half' },
      { id: 'step4', text: 'Return index if found or -1 if not' },
    ],
    correctAnswer: ['step1', 'step2', 'step3', 'step4'],
    explanation: 'Binary Search calculates the middle, compares with target, narrows the search range, and continues until found or range is empty.',
    order: 1,
    points: 2,
  },
  {
    algorithmSlug: 'binary-search',
    testType: TestType.POST_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'In Binary Search, if target < middle element, which half do we search next?',
    options: [
      { id: 'a', text: 'Right half' },
      { id: 'b', text: 'Left half' },
      { id: 'c', text: 'Both halves' },
      { id: 'd', text: 'Neither, search is complete' },
    ],
    correctAnswer: 'b',
    explanation: 'When target is less than the middle element in a sorted array, we search the left half because all elements in the right half are greater than the middle.',
    order: 2,
    points: 1,
  },

  // ===========================================
  // BFS Questions
  // ===========================================
  // Pre-test
  {
    algorithmSlug: 'bfs',
    testType: TestType.PRE_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'What data structure does BFS primarily use?',
    options: [
      { id: 'a', text: 'Stack' },
      { id: 'b', text: 'Queue' },
      { id: 'c', text: 'Heap' },
      { id: 'd', text: 'Tree' },
    ],
    correctAnswer: 'b',
    explanation: 'BFS uses a Queue (FIFO) to explore vertices level by level, ensuring all vertices at the current depth are visited before moving to the next level.',
    order: 1,
    points: 1,
  },
  {
    algorithmSlug: 'bfs',
    testType: TestType.PRE_TEST,
    questionType: QuestionType.TRUE_FALSE,
    questionText: 'BFS can find the shortest path in an unweighted graph.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    correctAnswer: 'true',
    explanation: 'BFS explores vertices level by level, so the first time it reaches a vertex is via the shortest path in terms of number of edges.',
    order: 2,
    points: 1,
  },
  // Post-test
  {
    algorithmSlug: 'bfs',
    testType: TestType.POST_TEST,
    questionType: QuestionType.DRAG_DROP_ORDER,
    questionText: 'Arrange BFS steps in correct order:',
    options: [
      { id: 'step1', text: 'Start from source, mark as visited, add to queue' },
      { id: 'step2', text: 'Dequeue a vertex' },
      { id: 'step3', text: 'Visit all unvisited neighbors' },
      { id: 'step4', text: 'Add neighbors to queue, repeat until queue is empty' },
    ],
    correctAnswer: ['step1', 'step2', 'step3', 'step4'],
    explanation: 'BFS starts from source, uses a queue to process vertices, visits neighbors, and continues until all reachable vertices are visited.',
    order: 1,
    points: 2,
  },
  {
    algorithmSlug: 'bfs',
    testType: TestType.POST_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'What is the time complexity of BFS for a graph with V vertices and E edges?',
    options: [
      { id: 'a', text: 'O(V)' },
      { id: 'b', text: 'O(E)' },
      { id: 'c', text: 'O(V + E)' },
      { id: 'd', text: 'O(V × E)' },
    ],
    correctAnswer: 'c',
    explanation: 'BFS visits each vertex once O(V) and explores each edge once O(E), giving a total time complexity of O(V + E).',
    order: 2,
    points: 1,
  },

  // ===========================================
  // Stack Questions
  // ===========================================
  // Pre-test
  {
    algorithmSlug: 'stack',
    testType: TestType.PRE_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'What principle does a Stack follow?',
    options: [
      { id: 'a', text: 'FIFO (First In, First Out)' },
      { id: 'b', text: 'LIFO (Last In, First Out)' },
      { id: 'c', text: 'Random Access' },
      { id: 'd', text: 'Priority Based' },
    ],
    correctAnswer: 'b',
    explanation: 'A Stack follows LIFO (Last In, First Out) principle - the last element added is the first one to be removed.',
    order: 1,
    points: 1,
  },
  {
    algorithmSlug: 'stack',
    testType: TestType.PRE_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'Which operation adds an element to a Stack?',
    options: [
      { id: 'a', text: 'Enqueue' },
      { id: 'b', text: 'Push' },
      { id: 'c', text: 'Insert' },
      { id: 'd', text: 'Add' },
    ],
    correctAnswer: 'b',
    explanation: 'The Push operation adds an element to the top of a Stack.',
    order: 2,
    points: 1,
  },
  // Post-test
  {
    algorithmSlug: 'stack',
    testType: TestType.POST_TEST,
    questionType: QuestionType.DRAG_DROP_MATCH,
    questionText: 'Match each Stack operation with its description:',
    options: [
      { id: 'push', text: 'Push' },
      { id: 'pop', text: 'Pop' },
      { id: 'peek', text: 'Peek' },
      { id: 'isEmpty', text: 'isEmpty' },
    ],
    correctAnswer: {
      'push': 'Add element to top',
      'pop': 'Remove element from top',
      'peek': 'View top element without removing',
      'isEmpty': 'Check if stack has no elements',
    },
    explanation: 'These are the four fundamental operations of a Stack data structure.',
    order: 1,
    points: 2,
  },
  {
    algorithmSlug: 'stack',
    testType: TestType.POST_TEST,
    questionType: QuestionType.MULTIPLE_CHOICE,
    questionText: 'What is the time complexity of Push and Pop operations in a Stack?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(log n)' },
      { id: 'c', text: 'O(1)' },
      { id: 'd', text: 'O(n²)' },
    ],
    correctAnswer: 'c',
    explanation: 'Both Push and Pop operations have O(1) time complexity because they only operate on the top of the Stack.',
    order: 2,
    points: 1,
  },
];

// ===========================================
// Seed Function
// ===========================================

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.testAnswer.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.playgroundSession.deleteMany();
  await prisma.question.deleteMany();
  await prisma.algorithm.deleteMany();
  // Don't delete users - they're created through auth

  // Seed algorithms
  console.log('📚 Seeding algorithms...');
  for (const algo of algorithmsData) {
    await prisma.algorithm.create({
      data: algo,
    });
    console.log(`   ✓ ${algo.name}`);
  }

  // Seed questions
  console.log('\n❓ Seeding questions...');
  for (const question of questionsData) {
    const algorithm = await prisma.algorithm.findUnique({
      where: { slug: question.algorithmSlug },
    });

    if (algorithm) {
      await prisma.question.create({
        data: {
          algorithmId: algorithm.id,
          testType: question.testType,
          questionType: question.questionType,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          order: question.order,
          points: question.points,
        },
      });
      console.log(`   ✓ ${question.algorithmSlug} - ${question.testType} - Q${question.order}`);
    }
  }

  console.log('\n✅ Database seed completed successfully!\n');

  // Print summary
  const algorithmCount = await prisma.algorithm.count();
  const questionCount = await prisma.question.count();
  console.log('📊 Summary:');
  console.log(`   - Algorithms: ${algorithmCount}`);
  console.log(`   - Questions: ${questionCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
