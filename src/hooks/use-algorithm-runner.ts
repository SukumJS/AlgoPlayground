'use client';

import { useCallback, useState } from 'react';
import { usePlaygroundStore, useVisualizerStore } from '@/stores';
import { AlgorithmStep, AlgorithmSlug } from '@/types';

// Type for algorithm generator function
type AlgorithmGenerator<T> = (input: T) => AlgorithmStep[];

// Registry of algorithm generators (to be populated)
const algorithmGenerators: Partial<Record<AlgorithmSlug, AlgorithmGenerator<unknown>>> = {};

/**
 * Register an algorithm generator
 */
export function registerAlgorithm<T>(
  slug: AlgorithmSlug,
  generator: AlgorithmGenerator<T>
) {
  algorithmGenerators[slug] = generator as AlgorithmGenerator<unknown>;
}

/**
 * Hook for running algorithm step generation
 */
export function useAlgorithmRunner() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    initializePlayground,
    regenerateSteps,
    setLoading,
    setError: setPlaygroundError,
  } = usePlaygroundStore();

  const { reset: resetVisualizer } = useVisualizerStore();

  /**
   * Initialize and run an algorithm with given input
   */
  const runAlgorithm = useCallback(
    async <T>(
      algorithmSlug: AlgorithmSlug,
      algorithmName: string,
      inputData: T,
      generator?: AlgorithmGenerator<T>
    ) => {
      setIsGenerating(true);
      setError(null);
      setLoading(true);

      try {
        // Get the generator function
        const gen = generator || (algorithmGenerators[algorithmSlug] as AlgorithmGenerator<T>);

        if (!gen) {
          throw new Error(`No generator found for algorithm: ${algorithmSlug}`);
        }

        // Generate steps
        const steps = gen(inputData);

        if (!steps || steps.length === 0) {
          throw new Error('Algorithm generated no steps');
        }

        // Initialize playground with generated steps
        initializePlayground({
          algorithmSlug,
          algorithmName,
          steps,
          inputData,
        });

        // Reset visualizer state
        resetVisualizer();

        setIsGenerating(false);
        setLoading(false);

        return steps;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to run algorithm';
        setError(errorMessage);
        setPlaygroundError(errorMessage);
        setIsGenerating(false);
        setLoading(false);
        return null;
      }
    },
    [initializePlayground, resetVisualizer, setLoading, setPlaygroundError]
  );

  /**
   * Regenerate steps with new input (same algorithm)
   */
  const regenerate = useCallback(
    async <T>(inputData: T, generator?: AlgorithmGenerator<T>) => {
      const { algorithmSlug } = usePlaygroundStore.getState();

      if (!algorithmSlug) {
        setError('No algorithm selected');
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const gen = generator || (algorithmGenerators[algorithmSlug] as AlgorithmGenerator<T>);

        if (!gen) {
          throw new Error(`No generator found for algorithm: ${algorithmSlug}`);
        }

        const steps = gen(inputData);

        if (!steps || steps.length === 0) {
          throw new Error('Algorithm generated no steps');
        }

        regenerateSteps(steps);
        resetVisualizer();

        setIsGenerating(false);
        return steps;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate';
        setError(errorMessage);
        setIsGenerating(false);
        return null;
      }
    },
    [regenerateSteps, resetVisualizer]
  );

  return {
    runAlgorithm,
    regenerate,
    isGenerating,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for getting algorithm info and generator
 */
export function useAlgorithmInfo(slug: AlgorithmSlug | null) {
  const hasGenerator = slug ? !!algorithmGenerators[slug] : false;

  return {
    hasGenerator,
    getGenerator: <T>() => 
      slug ? (algorithmGenerators[slug] as AlgorithmGenerator<T> | undefined) : undefined,
  };
}
