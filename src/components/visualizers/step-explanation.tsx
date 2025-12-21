'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlgorithmStep, StepType } from '@/types';
import {
  Info,
  ArrowRightLeft,
  Search,
  CheckCircle,
  XCircle,
  GitBranch,
  Merge,
  CircleDot,
  MoveRight,
  Flag,
} from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface StepExplanationProps {
  step: AlgorithmStep | null;
  className?: string;
}

// ===========================================
// Step Type Icons and Colors
// ===========================================

const stepTypeConfig: Record<StepType, { 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
  label: string;
}> = {
  'initialize': { 
    icon: Flag, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    label: 'Initialize'
  },
  'compare': { 
    icon: Search, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50',
    label: 'Compare'
  },
  'swap': { 
    icon: ArrowRightLeft, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50',
    label: 'Swap'
  },
  'move': { 
    icon: MoveRight, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50',
    label: 'Move'
  },
  'insert': { 
    icon: CircleDot, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    label: 'Insert'
  },
  'mark-sorted': { 
    icon: CheckCircle, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50',
    label: 'Sorted'
  },
  'visit': { 
    icon: CircleDot, 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50',
    label: 'Visit'
  },
  'split': { 
    icon: GitBranch, 
    color: 'text-violet-600', 
    bgColor: 'bg-violet-50',
    label: 'Split'
  },
  'merge': { 
    icon: Merge, 
    color: 'text-teal-600', 
    bgColor: 'bg-teal-50',
    label: 'Merge'
  },
  'found': { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    label: 'Found'
  },
  'not-found': { 
    icon: XCircle, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-50',
    label: 'Not Found'
  },
  'complete': { 
    icon: Flag, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    label: 'Complete'
  },
};

// ===========================================
// Step Explanation Component
// ===========================================

export function StepExplanation({ step, className }: StepExplanationProps) {
  if (!step) {
    return (
      <div className={cn(
        'bg-white rounded-xl border border-gray-200 p-6',
        className
      )}>
        <div className="text-center text-gray-400">
          <Info className="w-8 h-8 mx-auto mb-2" />
          <p>Press play to start the visualization</p>
        </div>
      </div>
    );
  }

  const config = stepTypeConfig[step.type] || stepTypeConfig['initialize'];
  const Icon = config.icon;

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className={cn('px-4 py-3 flex items-center gap-3', config.bgColor)}>
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          'bg-white shadow-sm'
        )}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>
        <div>
          <span className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            Step {step.id + 1}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="p-4">
        <p className="text-gray-800 font-medium mb-2">
          {step.description}
        </p>
        
        {/* Additional message */}
        {step.data?.message && (
          <p className="text-sm text-gray-600">
            {step.data.message}
          </p>
        )}

        {/* Variables */}
        {step.data?.variables && Object.keys(step.data.variables).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {Object.entries(step.data.variables).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                >
                  <span className="text-gray-500">{key}:</span>
                  <span className="font-mono font-medium text-gray-800">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ===========================================
// Compact Step Info (for inline display)
// ===========================================

interface CompactStepInfoProps {
  step: AlgorithmStep | null;
  className?: string;
}

export function CompactStepInfo({ step, className }: CompactStepInfoProps) {
  if (!step) return null;

  const config = stepTypeConfig[step.type] || stepTypeConfig['initialize'];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'w-6 h-6 rounded flex items-center justify-center',
        config.bgColor
      )}>
        <Icon className={cn('w-3 h-3', config.color)} />
      </div>
      <span className="text-sm text-gray-700 truncate">
        {step.description}
      </span>
    </div>
  );
}

// ===========================================
// Step History Panel
// ===========================================

interface StepHistoryProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  maxVisible?: number;
  className?: string;
}

export function StepHistory({
  steps,
  currentStepIndex,
  onStepClick,
  maxVisible = 10,
  className,
}: StepHistoryProps) {
  // Show steps around current step
  const startIndex = Math.max(0, currentStepIndex - Math.floor(maxVisible / 2));
  const endIndex = Math.min(steps.length, startIndex + maxVisible);
  const visibleSteps = steps.slice(startIndex, endIndex);

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200', className)}>
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-700">Step History</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {visibleSteps.map((step, index) => {
          const actualIndex = startIndex + index;
          const isCurrent = actualIndex === currentStepIndex;
          const isPast = actualIndex < currentStepIndex;
          const config = stepTypeConfig[step.type] || stepTypeConfig['initialize'];

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(actualIndex)}
              className={cn(
                'w-full px-4 py-2 flex items-center gap-3 text-left transition-colors',
                'hover:bg-gray-50',
                isCurrent && 'bg-primary-50 border-l-2 border-primary-500',
                isPast && 'opacity-60'
              )}
            >
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                isCurrent ? 'bg-primary-500 text-white' :
                isPast ? 'bg-gray-200 text-gray-600' :
                'bg-gray-100 text-gray-500'
              )}>
                {actualIndex + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'text-xs font-medium',
                  config.color
                )}>
                  {config.label}
                </span>
                <p className="text-sm text-gray-600 truncate">
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================
// Algorithm Info Panel
// ===========================================

interface AlgorithmInfoProps {
  name: string;
  complexity: {
    time: { best?: string; average?: string; worst: string };
    space: string;
  };
  stable?: boolean;
  className?: string;
}

export function AlgorithmInfo({
  name,
  complexity,
  stable,
  className,
}: AlgorithmInfoProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 p-4',
      className
    )}>
      <h2 className="font-semibold text-gray-900 mb-3">{name}</h2>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Time (Best)</span>
          <span className="font-mono text-gray-800">
            {complexity.time.best || complexity.time.worst}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Time (Avg)</span>
          <span className="font-mono text-gray-800">
            {complexity.time.average || complexity.time.worst}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Time (Worst)</span>
          <span className="font-mono text-gray-800">
            {complexity.time.worst}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Space</span>
          <span className="font-mono text-gray-800">{complexity.space}</span>
        </div>
        {stable !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-500">Stable</span>
            <span className={stable ? 'text-green-600' : 'text-red-600'}>
              {stable ? 'Yes' : 'No'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
