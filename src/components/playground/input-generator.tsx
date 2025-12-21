'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { generateRandomArray, shuffleArray } from '@/lib/utils';
import { AlgorithmCategory } from '@/types';
import {
  Shuffle,
  Plus,
  Minus,
  RotateCcw,
  Sliders,
  Target,
} from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface ArrayInputProps {
  values: number[];
  onChange: (values: number[]) => void;
  minSize?: number;
  maxSize?: number;
  minValue?: number;
  maxValue?: number;
  className?: string;
}

interface SearchInputProps {
  values: number[];
  target: number;
  onArrayChange: (values: number[]) => void;
  onTargetChange: (target: number) => void;
  sorted?: boolean;
  className?: string;
}

interface GraphInputProps {
  nodeCount: number;
  edges: { source: string; target: string; weight?: number }[];
  startNode: string;
  targetNode?: string;
  onNodeCountChange: (count: number) => void;
  onEdgesChange: (edges: { source: string; target: string; weight?: number }[]) => void;
  onStartNodeChange: (node: string) => void;
  onTargetNodeChange?: (node: string) => void;
  weighted?: boolean;
  className?: string;
}

// ===========================================
// Array Input Component
// ===========================================

export function ArrayInput({
  values,
  onChange,
  minSize = 3,
  maxSize = 15,
  minValue = 1,
  maxValue = 100,
  className,
}: ArrayInputProps) {
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleRandomize = useCallback(() => {
    const newArray = generateRandomArray(values.length, minValue, maxValue);
    onChange(newArray);
  }, [values.length, minValue, maxValue, onChange]);

  const handleShuffle = useCallback(() => {
    onChange(shuffleArray([...values]));
  }, [values, onChange]);

  const handleSizeChange = useCallback((delta: number) => {
    const newSize = Math.max(minSize, Math.min(maxSize, values.length + delta));
    if (newSize > values.length) {
      const newValues = [...values];
      for (let i = values.length; i < newSize; i++) {
        newValues.push(Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue);
      }
      onChange(newValues);
    } else if (newSize < values.length) {
      onChange(values.slice(0, newSize));
    }
  }, [values, minSize, maxSize, minValue, maxValue, onChange]);

  const handleValueChange = useCallback((index: number, value: number) => {
    const newValues = [...values];
    newValues[index] = Math.max(minValue, Math.min(maxValue, value));
    onChange(newValues);
  }, [values, minValue, maxValue, onChange]);

  const handleReset = useCallback(() => {
    onChange(generateRandomArray(8, minValue, maxValue));
  }, [minValue, maxValue, onChange]);

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Input Array</h3>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isCustomizing ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-500'
          )}
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleRandomize}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Randomize</span>
        </button>
        <button
          onClick={handleShuffle}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          <span>Shuffle</span>
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Size Controls */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Size: {values.length}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleSizeChange(-1)}
            disabled={values.length <= minSize}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{values.length}</span>
          <button
            onClick={() => handleSizeChange(1)}
            disabled={values.length >= maxSize}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Array Preview */}
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {isCustomizing ? (
              <input
                type="number"
                value={value}
                onChange={(e) => handleValueChange(index, parseInt(e.target.value) || 0)}
                className="w-12 h-10 text-center border border-gray-300 rounded-lg text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                min={minValue}
                max={maxValue}
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                {value}
              </div>
            )}
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
              {index}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Custom Input */}
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-4 border-t border-gray-100"
        >
          <label className="block text-sm text-gray-600 mb-2">
            Or paste comma-separated values:
          </label>
          <input
            type="text"
            placeholder="e.g., 64, 34, 25, 12, 22"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            onChange={(e) => {
              const parsed = e.target.value
                .split(',')
                .map((v) => parseInt(v.trim()))
                .filter((v) => !isNaN(v) && v >= minValue && v <= maxValue)
                .slice(0, maxSize);
              if (parsed.length >= minSize) {
                onChange(parsed);
              }
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

// ===========================================
// Search Input Component
// ===========================================

export function SearchInput({
  values,
  target,
  onArrayChange,
  onTargetChange,
  sorted = false,
  className,
}: SearchInputProps) {
  const handleRandomize = useCallback(() => {
    let newArray = generateRandomArray(values.length, 1, 50);
    if (sorted) {
      newArray = newArray.sort((a, b) => a - b);
    }
    onArrayChange(newArray);
    // Set target to a value that exists in the array (80% chance)
    if (Math.random() < 0.8) {
      onTargetChange(newArray[Math.floor(Math.random() * newArray.length)]);
    } else {
      onTargetChange(Math.floor(Math.random() * 50) + 1);
    }
  }, [values.length, sorted, onArrayChange, onTargetChange]);

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-4', className)}>
      <h3 className="text-sm font-medium text-gray-700 mb-4">Search Input</h3>

      {/* Array Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Array {sorted && '(sorted)'}
          </span>
          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
          >
            <Shuffle className="w-3 h-3" />
            <span>Randomize</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {values.map((value, index) => (
            <div
              key={index}
              className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded text-sm font-medium text-gray-700"
            >
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Target Input */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">Target:</span>
        </div>
        <input
          type="number"
          value={target}
          onChange={(e) => onTargetChange(parseInt(e.target.value) || 0)}
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        <span className="text-xs text-gray-400">
          {values.includes(target) ? '(exists in array)' : '(not in array)'}
        </span>
      </div>
    </div>
  );
}

// ===========================================
// Graph Input Component
// ===========================================

export function GraphInput({
  nodeCount,
  edges,
  startNode,
  targetNode,
  onNodeCountChange,
  onEdgesChange,
  onStartNodeChange,
  onTargetNodeChange,
  weighted = false,
  className,
}: GraphInputProps) {
  const nodeLabels = Array.from({ length: nodeCount }, (_, i) => 
    String.fromCharCode(65 + i) // A, B, C, ...
  );

  const handlePresetGraph = (type: 'simple' | 'tree' | 'cycle') => {
    let newEdges: { source: string; target: string; weight?: number }[] = [];
    
    switch (type) {
      case 'simple':
        newEdges = [
          { source: 'A', target: 'B', weight: 4 },
          { source: 'A', target: 'C', weight: 2 },
          { source: 'B', target: 'D', weight: 5 },
          { source: 'C', target: 'D', weight: 8 },
          { source: 'D', target: 'E', weight: 2 },
        ];
        onNodeCountChange(5);
        break;
      case 'tree':
        newEdges = [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'A', target: 'C', weight: 1 },
          { source: 'B', target: 'D', weight: 1 },
          { source: 'B', target: 'E', weight: 1 },
          { source: 'C', target: 'F', weight: 1 },
        ];
        onNodeCountChange(6);
        break;
      case 'cycle':
        newEdges = [
          { source: 'A', target: 'B', weight: 1 },
          { source: 'B', target: 'C', weight: 1 },
          { source: 'C', target: 'D', weight: 1 },
          { source: 'D', target: 'A', weight: 1 },
        ];
        onNodeCountChange(4);
        break;
    }
    
    onEdgesChange(newEdges);
    onStartNodeChange('A');
  };

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-4', className)}>
      <h3 className="text-sm font-medium text-gray-700 mb-4">Graph Input</h3>

      {/* Preset Graphs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handlePresetGraph('simple')}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Simple Graph
        </button>
        <button
          onClick={() => handlePresetGraph('tree')}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Tree
        </button>
        <button
          onClick={() => handlePresetGraph('cycle')}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Cycle
        </button>
      </div>

      {/* Start/Target Node */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Start Node</label>
          <select
            value={startNode}
            onChange={(e) => onStartNodeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {nodeLabels.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        </div>
        {onTargetNodeChange && (
          <div>
            <label className="block text-sm text-gray-500 mb-1">Target Node</label>
            <select
              value={targetNode || ''}
              onChange={(e) => onTargetNodeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">None</option>
              {nodeLabels.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Edge List */}
      <div>
        <label className="block text-sm text-gray-500 mb-2">
          Edges ({edges.length})
        </label>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {edges.map((edge, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                {edge.source} → {edge.target}
              </span>
              {weighted && edge.weight !== undefined && (
                <span className="text-gray-500">w={edge.weight}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Input Generator Factory
// ===========================================

interface InputGeneratorProps {
  category: AlgorithmCategory;
  algorithmSlug: string;
  inputData: unknown;
  onInputChange: (data: unknown) => void;
  className?: string;
}

export function InputGenerator({
  category,
  algorithmSlug,
  inputData,
  onInputChange,
  className,
}: InputGeneratorProps) {
  switch (category) {
    case 'SORTING':
      return (
        <ArrayInput
          values={(inputData as number[]) || generateRandomArray(8, 1, 100)}
          onChange={onInputChange}
          className={className}
        />
      );

    case 'SEARCHING':
      const searchData = inputData as { array: number[]; target: number } || {
        array: algorithmSlug === 'binary-search' 
          ? [1, 3, 5, 7, 9, 11, 13, 15] 
          : generateRandomArray(8, 1, 50),
        target: 7,
      };
      return (
        <SearchInput
          values={searchData.array}
          target={searchData.target}
          onArrayChange={(arr) => onInputChange({ ...searchData, array: arr })}
          onTargetChange={(t) => onInputChange({ ...searchData, target: t })}
          sorted={algorithmSlug === 'binary-search'}
          className={className}
        />
      );

    case 'GRAPH':
      const graphData = inputData as {
        nodeCount: number;
        edges: { source: string; target: string; weight?: number }[];
        startNode: string;
        targetNode?: string;
      } || {
        nodeCount: 5,
        edges: [
          { source: 'A', target: 'B' },
          { source: 'A', target: 'C' },
          { source: 'B', target: 'D' },
          { source: 'C', target: 'D' },
          { source: 'D', target: 'E' },
        ],
        startNode: 'A',
        targetNode: 'E',
      };
      return (
        <GraphInput
          {...graphData}
          onNodeCountChange={(count) => onInputChange({ ...graphData, nodeCount: count })}
          onEdgesChange={(edges) => onInputChange({ ...graphData, edges })}
          onStartNodeChange={(node) => onInputChange({ ...graphData, startNode: node })}
          onTargetNodeChange={(node) => onInputChange({ ...graphData, targetNode: node })}
          className={className}
        />
      );

    default:
      return (
        <div className={cn('bg-white rounded-xl border border-gray-200 p-4 text-center text-gray-400', className)}>
          Input configuration not available for this algorithm type.
        </div>
      );
  }
}
