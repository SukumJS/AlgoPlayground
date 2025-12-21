import { AlgorithmStep, StepType, ElementState, ArrayElement, AlgorithmSlug } from '@/types';
import { generateId } from '@/lib/utils';

// ===========================================
// Step Builder Helper
// ===========================================

let stepCounter = 0;

export function resetStepCounter() {
  stepCounter = 0;
}

export function createStep(
  type: StepType,
  description: string,
  data: AlgorithmStep['data'],
  codeLineHighlight?: number[]
): AlgorithmStep {
  return {
    id: stepCounter++,
    type,
    description,
    data,
    codeLineHighlight,
    timestamp: Date.now(),
  };
}

// ===========================================
// Array Helpers
// ===========================================

export function createArrayElements(values: number[]): ArrayElement[] {
  return values.map((value, index) => ({
    id: `el-${index}`,
    value,
    state: 'default' as ElementState,
  }));
}

export function updateElementStates(
  elements: ArrayElement[],
  updates: { indices: number[]; state: ElementState }[]
): ArrayElement[] {
  const newElements = elements.map((el) => ({ ...el, state: 'default' as ElementState }));
  
  for (const { indices, state } of updates) {
    for (const index of indices) {
      if (index >= 0 && index < newElements.length) {
        newElements[index] = { ...newElements[index], state };
      }
    }
  }
  
  return newElements;
}

export function swapElements(elements: ArrayElement[], i: number, j: number): ArrayElement[] {
  const newElements = [...elements];
  [newElements[i], newElements[j]] = [newElements[j], newElements[i]];
  return newElements;
}

export function markSorted(elements: ArrayElement[], indices: number[]): ArrayElement[] {
  return elements.map((el, index) => ({
    ...el,
    state: indices.includes(index) ? 'sorted' : el.state,
  }));
}

export function markAllSorted(elements: ArrayElement[]): ArrayElement[] {
  return elements.map((el) => ({ ...el, state: 'sorted' as ElementState }));
}

// ===========================================
// Algorithm Generator Type
// ===========================================

export type AlgorithmGenerator<TInput = unknown, TConfig = unknown> = (
  input: TInput,
  config?: TConfig
) => AlgorithmStep[];

// ===========================================
// Algorithm Registry
// ===========================================

const algorithmRegistry = new Map<AlgorithmSlug, AlgorithmGenerator>();

export function registerAlgorithm<TInput, TConfig = unknown>(
  slug: AlgorithmSlug,
  generator: AlgorithmGenerator<TInput, TConfig>
) {
  algorithmRegistry.set(slug, generator as AlgorithmGenerator);
}

export function getAlgorithmGenerator(slug: AlgorithmSlug): AlgorithmGenerator | undefined {
  return algorithmRegistry.get(slug);
}

export function hasAlgorithm(slug: AlgorithmSlug): boolean {
  return algorithmRegistry.has(slug);
}

export function getAllRegisteredAlgorithms(): AlgorithmSlug[] {
  return Array.from(algorithmRegistry.keys());
}

// ===========================================
// Code Snippets Type
// ===========================================

export interface CodeSnippet {
  language: 'javascript' | 'python' | 'java' | 'cpp';
  code: string;
  lineMapping?: Record<number, string>; // line number -> description
}

export interface AlgorithmCode {
  javascript?: CodeSnippet;
  python?: CodeSnippet;
  java?: CodeSnippet;
  cpp?: CodeSnippet;
}
