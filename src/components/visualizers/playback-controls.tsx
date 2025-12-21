'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Gauge,
} from 'lucide-react';

// ===========================================
// Types
// ===========================================

interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onGoToStep: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  canStepForward: boolean;
  canStepBackward: boolean;
  className?: string;
}

// ===========================================
// Speed Presets
// ===========================================

const speedPresets = [
  { label: '0.5x', value: 1000 },
  { label: '1x', value: 500 },
  { label: '2x', value: 250 },
  { label: '4x', value: 125 },
];

// ===========================================
// Playback Controls Component
// ===========================================

export function PlaybackControls({
  isPlaying,
  isPaused,
  isCompleted,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStop,
  onStepForward,
  onStepBackward,
  onGoToStep,
  onSpeedChange,
  canStepForward,
  canStepBackward,
  className,
}: PlaybackControlsProps) {
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-4', className)}>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        
        {/* Step markers */}
        <div className="relative mt-1 h-2">
          {Array.from({ length: Math.min(totalSteps, 20) }).map((_, i) => {
            const stepIndex = Math.floor((i / 20) * totalSteps);
            const position = ((stepIndex + 0.5) / totalSteps) * 100;
            const isCurrent = stepIndex === currentStep;
            const isPast = stepIndex < currentStep;

            return (
              <button
                key={i}
                onClick={() => onGoToStep(stepIndex)}
                className={cn(
                  'absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 transition-all',
                  isCurrent ? 'bg-primary-500 scale-150' :
                  isPast ? 'bg-primary-300' : 'bg-gray-300',
                  'hover:scale-150'
                )}
                style={{ left: `${position}%` }}
                title={`Go to step ${stepIndex + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Reset */}
        <ControlButton
          onClick={onStop}
          disabled={currentStep === 0 && !isPlaying}
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </ControlButton>

        {/* Step Back */}
        <ControlButton
          onClick={onStepBackward}
          disabled={!canStepBackward || isPlaying}
          title="Previous step"
        >
          <SkipBack className="w-4 h-4" />
        </ControlButton>

        {/* Play/Pause */}
        <motion.button
          onClick={isPlaying ? onPause : onPlay}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            'text-white shadow-lg transition-all',
            isPlaying 
              ? 'bg-amber-500 hover:bg-amber-600' 
              : 'bg-primary-500 hover:bg-primary-600',
            isCompleted && 'bg-green-500 hover:bg-green-600'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isPlaying ? 'Pause' : isCompleted ? 'Replay' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </motion.button>

        {/* Step Forward */}
        <ControlButton
          onClick={onStepForward}
          disabled={!canStepForward || isPlaying}
          title="Next step"
        >
          <SkipForward className="w-4 h-4" />
        </ControlButton>

        {/* Speed Control */}
        <SpeedControl speed={speed} onSpeedChange={onSpeedChange} />
      </div>

      {/* Status */}
      <div className="mt-4 text-center">
        <span className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
          isPlaying ? 'bg-blue-100 text-blue-700' :
          isCompleted ? 'bg-green-100 text-green-700' :
          isPaused ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-600'
        )}>
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            isPlaying ? 'bg-blue-500 animate-pulse' :
            isCompleted ? 'bg-green-500' :
            isPaused ? 'bg-amber-500' :
            'bg-gray-400'
          )} />
          {isPlaying ? 'Playing' :
           isCompleted ? 'Completed' :
           isPaused ? 'Paused' :
           'Ready'}
        </span>
      </div>
    </div>
  );
}

// ===========================================
// Control Button Component
// ===========================================

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ControlButton({ onClick, disabled, title, children }: ControlButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        'bg-gray-100 text-gray-700 transition-all',
        'hover:bg-gray-200',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100'
      )}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {children}
    </motion.button>
  );
}

// ===========================================
// Speed Control Component
// ===========================================

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

function SpeedControl({ speed, onSpeedChange }: SpeedControlProps) {
  const currentPreset = speedPresets.find(p => p.value === speed) || speedPresets[1];

  const cycleSpeed = () => {
    const currentIndex = speedPresets.findIndex(p => p.value === speed);
    const nextIndex = (currentIndex + 1) % speedPresets.length;
    onSpeedChange(speedPresets[nextIndex].value);
  };

  return (
    <motion.button
      onClick={cycleSpeed}
      className={cn(
        'h-10 px-3 rounded-lg flex items-center gap-1.5',
        'bg-gray-100 text-gray-700 transition-all',
        'hover:bg-gray-200'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Change speed"
    >
      <Gauge className="w-4 h-4" />
      <span className="text-sm font-medium min-w-[2.5rem]">
        {currentPreset.label}
      </span>
    </motion.button>
  );
}

// ===========================================
// Compact Playback Controls (for embedded use)
// ===========================================

interface CompactPlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  canStepForward: boolean;
  canStepBackward: boolean;
  className?: string;
}

export function CompactPlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  canStepForward,
  canStepBackward,
  className,
}: CompactPlaybackControlsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={onStepBackward}
        disabled={!canStepBackward}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <button
        onClick={isPlaying ? onPause : onPlay}
        className={cn(
          'p-2 rounded-full',
          isPlaying ? 'bg-amber-100 text-amber-600' : 'bg-primary-100 text-primary-600'
        )}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      
      <button
        onClick={onStepForward}
        disabled={!canStepForward}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ===========================================
// Step Slider Component
// ===========================================

interface StepSliderProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  disabled?: boolean;
  className?: string;
}

export function StepSlider({
  currentStep,
  totalSteps,
  onStepChange,
  disabled,
  className,
}: StepSliderProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-sm text-gray-500 w-16">
        {currentStep + 1}/{totalSteps}
      </span>
      <input
        type="range"
        min={0}
        max={totalSteps - 1}
        value={currentStep}
        onChange={(e) => onStepChange(parseInt(e.target.value))}
        disabled={disabled}
        className={cn(
          'flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
          'accent-primary-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
    </div>
  );
}
