'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlaygroundStore, selectIsPlaying } from '@/stores';

/**
 * Hook for managing algorithm playback with auto-advance
 * Handles the play/pause loop and step timing
 */
export function usePlayback() {
  const {
    playbackState,
    speed,
    currentStepIndex,
    steps,
    play,
    pause,
    stop,
    stepForward,
    stepBackward,
    goToStep,
    setSpeed,
  } = usePlaygroundStore();
  
  const isPlaying = usePlaygroundStore(selectIsPlaying);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle auto-advance when playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        stepForward();
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, stepForward]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Speed presets
  const speedPresets = {
    slow: 1000,
    normal: 500,
    fast: 250,
    veryFast: 100,
  };

  const setSpeedPreset = useCallback((preset: keyof typeof speedPresets) => {
    setSpeed(speedPresets[preset]);
  }, [setSpeed]);

  return {
    // State
    playbackState,
    isPlaying,
    isPaused: playbackState === 'paused',
    isCompleted: playbackState === 'completed',
    isIdle: playbackState === 'idle',
    speed,
    currentStep: currentStepIndex,
    totalSteps: steps.length,
    progress: steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0,
    
    // Actions
    play,
    pause,
    stop,
    togglePlayPause,
    stepForward,
    stepBackward,
    goToStep,
    setSpeed,
    setSpeedPreset,
    
    // Helpers
    canStepForward: currentStepIndex < steps.length - 1,
    canStepBackward: currentStepIndex > 0,
    speedPresets,
  };
}
