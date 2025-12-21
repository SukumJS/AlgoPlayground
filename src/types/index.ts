// ===========================================
// Algorithm Types
// ===========================================

export type AlgorithmCategory =
  | 'SORTING'
  | 'SEARCHING'
  | 'GRAPH'
  | 'TREE'
  | 'LINEAR_STRUCTURE';

export type AlgorithmSlug =
  // Sorting
  | 'bubble-sort'
  | 'selection-sort'
  | 'insertion-sort'
  | 'merge-sort'
  // Searching
  | 'linear-search'
  | 'binary-search'
  // Graph
  | 'bfs'
  | 'dfs'
  | 'dijkstra'
  | 'bellman-ford'
  | 'prims'
  | 'kruskals'
  // Tree
  | 'bst-operations'
  | 'avl-tree'
  | 'min-heap'
  | 'max-heap'
  | 'tree-traversals'
  // Linear
  | 'singly-linked-list'
  | 'doubly-linked-list'
  | 'stack'
  | 'queue';

export interface AlgorithmMetadata {
  slug: AlgorithmSlug;
  name: string;
  category: AlgorithmCategory;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stable?: boolean; // For sorting algorithms
  useCases: string[];
}

// ===========================================
// Visualization Types
// ===========================================

export type ElementState =
  | 'default'
  | 'comparing'
  | 'swapping'
  | 'sorted'
  | 'current'
  | 'visited'
  | 'path'
  | 'highlight'
  | 'pivot'
  | 'minimum'
  | 'found'
  | 'not-found';

export interface ArrayElement {
  id: string;
  value: number;
  state: ElementState;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state: ElementState;
  distance?: number; // For shortest path algorithms
  parent?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  state: ElementState;
  directed?: boolean;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
}

export interface TreeNode {
  id: string;
  value: number;
  state: ElementState;
  left?: TreeNode;
  right?: TreeNode;
  height?: number; // For AVL trees
  parent?: string;
  x?: number;
  y?: number;
}

export interface LinkedListNode {
  id: string;
  value: number;
  state: ElementState;
  next?: string;
  prev?: string; // For doubly linked list
}

export interface LinkedList {
  head: string | null;
  tail: string | null;
  nodes: Map<string, LinkedListNode>;
  type: 'singly' | 'doubly';
}

export interface StackQueueItem {
  id: string;
  value: number;
  state: ElementState;
}

// ===========================================
// Algorithm Step Types
// ===========================================

export interface AlgorithmStep {
  id: number;
  type: StepType;
  description: string;
  codeLineHighlight?: number[];
  data: StepData;
  timestamp?: number;
}

export type StepType =
  | 'initialize'
  | 'compare'
  | 'swap'
  | 'move'
  | 'insert'
  | 'delete'
  | 'visit'
  | 'mark-sorted'
  | 'found'
  | 'not-found'
  | 'complete'
  | 'merge'
  | 'split'
  | 'update-distance'
  | 'relax-edge'
  | 'add-to-mst'
  | 'rotate'; // For AVL

export interface StepData {
  // Array-based algorithms
  array?: ArrayElement[];
  comparing?: [number, number];
  swapping?: [number, number];
  sortedIndices?: number[];
  
  // Search algorithms
  left?: number;
  right?: number;
  mid?: number;
  target?: number;
  found?: boolean;
  foundIndex?: number;
  
  // Graph algorithms
  graph?: Graph;
  currentNode?: string;
  visitedNodes?: string[];
  queue?: string[];
  stack?: string[];
  distances?: Record<string, number>;
  parents?: Record<string, string | null>;
  mstEdges?: string[];
  
  // Tree algorithms
  tree?: TreeNode;
  currentNodeId?: string;
  traversalOrder?: string[];
  
  // Linear structures
  linkedList?: LinkedList;
  stack?: StackQueueItem[];
  queue?: StackQueueItem[];
  
  // General
  message?: string;
  variables?: Record<string, number | string | boolean>;
}

// ===========================================
// Playground Types
// ===========================================

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'completed';

export interface PlaygroundState {
  algorithmSlug: AlgorithmSlug | null;
  steps: AlgorithmStep[];
  currentStepIndex: number;
  playbackState: PlaybackState;
  speed: number; // ms between steps
  inputData: unknown;
  isLoading: boolean;
  error: string | null;
}

export interface PlaygroundSession {
  id: string;
  userId: string;
  algorithmId: string;
  currentStep: number;
  totalSteps: number;
  inputData: unknown;
  visualState: unknown;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// Test Types
// ===========================================

export type TestType = 'PRE_TEST' | 'POST_TEST';

export type QuestionType =
  | 'multiple-choice'
  | 'drag-drop-order'
  | 'drag-drop-match'
  | 'fill-blank'
  | 'true-false';

export interface Question {
  id: string;
  algorithmSlug: AlgorithmSlug;
  testType: TestType;
  questionType: QuestionType;
  questionText: string;
  options?: QuestionOption[];
  correctAnswer: CorrectAnswer;
  explanation: string;
  order: number;
  points?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCode?: boolean;
}

export type CorrectAnswer =
  | string // For multiple-choice, true-false, fill-blank
  | string[] // For drag-drop-order
  | Record<string, string>; // For drag-drop-match

export interface UserAnswer {
  questionId: string;
  answer: string | string[] | Record<string, string>;
  isCorrect?: boolean;
  timeTaken?: number; // in seconds
}

export interface TestResult {
  id: string;
  userId: string;
  algorithmSlug: AlgorithmSlug;
  testType: TestType;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: UserAnswer[];
  completedAt: Date;
}

// ===========================================
// User & Progress Types
// ===========================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  userId: string;
  algorithmSlug: AlgorithmSlug;
  preTestCompleted: boolean;
  preTestScore: number | null;
  playgroundCompleted: boolean;
  postTestCompleted: boolean;
  postTestScore: number | null;
  lastAccessedAt: Date;
}

export interface AlgorithmProgress {
  algorithm: AlgorithmMetadata;
  progress: UserProgress | null;
  status: 'not-started' | 'in-progress' | 'completed';
}

// ===========================================
// Component Props Types
// ===========================================

export interface VisualizerProps<T = unknown> {
  data: T;
  step: AlgorithmStep;
  isAnimating: boolean;
  className?: string;
}

export interface ControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  playbackState: PlaybackState;
  currentStep: number;
  totalSteps: number;
  speed: number;
  disabled?: boolean;
}

// ===========================================
// API Types
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SessionSaveRequest {
  algorithmSlug: AlgorithmSlug;
  currentStep: number;
  totalSteps: number;
  inputData: unknown;
  visualState: unknown;
  isCompleted: boolean;
}

export interface TestSubmitRequest {
  algorithmSlug: AlgorithmSlug;
  testType: TestType;
  answers: UserAnswer[];
}
