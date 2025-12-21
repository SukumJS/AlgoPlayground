'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlgorithmMetadata, AlgorithmCategory, AlgorithmStep } from '@/types';
import { usePlaygroundStore, useVisualizerStore, selectCurrentStep } from '@/stores';
import { usePlayback } from '@/hooks';
import {
  ArrayVisualizer,
  CompactArrayVisualizer,
  GraphVisualizer,
  TreeVisualizer,
  LinkedListVisualizer,
  StackVisualizer,
  QueueVisualizer,
  PlaybackControls,
  StepExplanation,
  CodePanel,
  AlgorithmInfo,
} from '@/components/visualizers';
import { InputGenerator } from './input-generator';
import {
  getAlgorithmGenerator,
  initializeAlgorithms,
  getAlgorithmCode,
} from '@/algorithms';
import { createGraph, sampleGraphs } from '@/algorithms/graph';
import { generateRandomArray } from '@/lib/utils';
import {
  Settings,
  Code2,
  Info,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// Initialize algorithms on module load
initializeAlgorithms();

// ===========================================
// Types
// ===========================================

interface PlaygroundProps {
  algorithm: AlgorithmMetadata;
  className?: string;
}

// ===========================================
// Main Playground Component
// ===========================================

export function Playground({ algorithm, className }: PlaygroundProps) {
  const [showCode, setShowCode] = useState(true);
  const [showInput, setShowInput] = useState(true);
  const [inputData, setInputData] = useState<unknown>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Store access
  const {
    steps,
    currentStepIndex,
    playbackState,
    initializePlayground,
    regenerateSteps,
    setInputData: setStoreInputData,
  } = usePlaygroundStore();

  const currentStep = usePlaygroundStore(selectCurrentStep);
  const { settings } = useVisualizerStore();

  // Playback controls
  const playback = usePlayback();

  // Get code for this algorithm
  const algorithmCode = useMemo(() => 
    getAlgorithmCode(algorithm.slug),
    [algorithm.slug]
  );

  // Initialize with default input
  useEffect(() => {
    if (isInitialized) return;

    const defaultInput = getDefaultInput(algorithm.category, algorithm.slug);
    setInputData(defaultInput);
    
    const generator = getAlgorithmGenerator(algorithm.slug);
    if (generator) {
      const generatedSteps = generator(defaultInput);
      initializePlayground({
        algorithmSlug: algorithm.slug,
        algorithmName: algorithm.name,
        steps: generatedSteps,
        inputData: defaultInput,
      });
    }
    
    setIsInitialized(true);
  }, [algorithm, initializePlayground, isInitialized]);

  // Handle input change and regenerate steps
  const handleInputChange = useCallback((newInput: unknown) => {
    setInputData(newInput);
    setStoreInputData(newInput);

    const generator = getAlgorithmGenerator(algorithm.slug);
    if (generator) {
      const newSteps = generator(newInput);
      regenerateSteps(newSteps);
    }
  }, [algorithm.slug, regenerateSteps, setStoreInputData]);

  // Render the appropriate visualizer
  const renderVisualizer = () => {
    if (!currentStep) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          Press play to start the visualization
        </div>
      );
    }

    switch (algorithm.category) {
      case 'SORTING':
        return (
          <ArrayVisualizer
            elements={currentStep.data?.array || []}
            comparing={currentStep.data?.comparing}
            swapping={currentStep.data?.swapping}
            showValues={settings.showValues}
            showIndices={settings.showIndices}
          />
        );

      case 'SEARCHING':
        if (algorithm.slug === 'binary-search') {
          return (
            <CompactArrayVisualizer
              elements={currentStep.data?.array || []}
              left={currentStep.data?.left}
              right={currentStep.data?.right}
              mid={currentStep.data?.mid}
              target={currentStep.data?.target}
            />
          );
        }
        return (
          <CompactArrayVisualizer
            elements={currentStep.data?.array || []}
            mid={currentStep.data?.mid}
            target={currentStep.data?.target}
          />
        );

      case 'GRAPH':
        const graphData = currentStep.data?.graph;
        if (!graphData) {
          return (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No graph data available
            </div>
          );
        }
        return (
          <GraphVisualizer
            graph={graphData}
            currentNode={currentStep.data?.currentNode}
            visitedNodes={currentStep.data?.visitedNodes}
            showWeights={settings.showWeights}
          />
        );

      case 'TREE':
        return (
          <TreeVisualizer
            root={currentStep.data?.tree || null}
            currentNodeId={currentStep.data?.currentNode}
            visitedNodes={currentStep.data?.visitedNodes}
          />
        );

      case 'LINEAR_STRUCTURE':
        if (algorithm.slug.includes('stack')) {
          return (
            <StackVisualizer
              items={currentStep.data?.stack || []}
            />
          );
        }
        if (algorithm.slug.includes('queue')) {
          return (
            <QueueVisualizer
              items={currentStep.data?.queue || []}
            />
          );
        }
        return (
          <LinkedListVisualizer
            list={currentStep.data?.linkedList || { head: null, tail: null, nodes: new Map(), type: 'singly' }}
            currentNodeId={currentStep.data?.currentNode}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Visualization not available for this algorithm type
          </div>
        );
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel: Input (collapsible) */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <div className="h-full overflow-y-auto pr-2">
                <InputGenerator
                  category={algorithm.category}
                  algorithmSlug={algorithm.slug}
                  inputData={inputData}
                  onInputChange={handleInputChange}
                  className="mb-4"
                />
                <AlgorithmInfo
                  name={algorithm.name}
                  complexity={{
                    time: algorithm.timeComplexity,
                    space: algorithm.spaceComplexity,
                  }}
                  stable={algorithm.stable}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle for Input Panel */}
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex-shrink-0 w-6 h-24 self-center bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
          title={showInput ? 'Hide input panel' : 'Show input panel'}
        >
          {showInput ? (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Center: Visualization */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Visualizer Container */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 overflow-hidden">
            <div className="h-full flex items-center justify-center">
              {renderVisualizer()}
            </div>
          </div>

          {/* Step Explanation */}
          <div className="mt-4">
            <StepExplanation step={currentStep} />
          </div>

          {/* Playback Controls */}
          <div className="mt-4">
            <PlaybackControls
              isPlaying={playback.isPlaying}
              isPaused={playback.isPaused}
              isCompleted={playback.isCompleted}
              currentStep={playback.currentStep}
              totalSteps={playback.totalSteps}
              speed={playback.speed}
              onPlay={playback.play}
              onPause={playback.pause}
              onStop={playback.stop}
              onStepForward={playback.stepForward}
              onStepBackward={playback.stepBackward}
              onGoToStep={playback.goToStep}
              onSpeedChange={playback.setSpeed}
              canStepForward={playback.canStepForward}
              canStepBackward={playback.canStepBackward}
            />
          </div>
        </div>

        {/* Toggle for Code Panel */}
        <button
          onClick={() => setShowCode(!showCode)}
          className="flex-shrink-0 w-6 h-24 self-center bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors"
          title={showCode ? 'Hide code panel' : 'Show code panel'}
        >
          {showCode ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Right Panel: Code (collapsible) */}
        <AnimatePresence>
          {showCode && algorithmCode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <div className="h-full overflow-y-auto pl-2">
                <CodePanel
                  code={algorithmCode}
                  highlightedLines={currentStep?.codeLineHighlight || []}
                  className="h-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ===========================================
// Helper: Get Default Input
// ===========================================

function getDefaultInput(category: AlgorithmCategory, slug: string): unknown {
  switch (category) {
    case 'SORTING':
      return generateRandomArray(8, 1, 100);

    case 'SEARCHING':
      if (slug === 'binary-search') {
        return {
          array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19],
          target: 7,
        };
      }
      return {
        array: generateRandomArray(10, 1, 50),
        target: Math.floor(Math.random() * 50) + 1,
      };

    case 'GRAPH':
      const graphInput = sampleGraphs.simple;
      return {
        graph: graphInput,
        startNode: 'A',
        targetNode: 'E',
      };

    case 'TREE':
      return {
        values: [50, 30, 70, 20, 40, 60, 80],
        operation: 'insert',
      };

    case 'LINEAR_STRUCTURE':
      return {
        values: [1, 2, 3, 4, 5],
      };

    default:
      return null;
  }
}

// ===========================================
// Playground Skeleton (for loading)
// ===========================================

export function PlaygroundSkeleton() {
  return (
    <div className="flex gap-4 h-full animate-pulse">
      <div className="w-72 bg-gray-200 rounded-xl" />
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 bg-gray-200 rounded-xl" />
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>
      <div className="w-96 bg-gray-200 rounded-xl" />
    </div>
  );
}
