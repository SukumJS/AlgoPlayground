'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore, usePlaygroundStore } from '@/stores';
import { AlgorithmSlug } from '@/types';

interface UseAutoSaveOptions {
  enabled?: boolean;
  interval?: number; // ms
  onSave?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook for auto-saving playground session to the server
 */
export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    onSave,
    onError,
  } = options;

  const {
    currentSession,
    hasPendingChanges,
    isSyncing,
    saveSession,
    updateSession,
    syncError,
  } = useSessionStore();

  const {
    algorithmSlug,
    currentStepIndex,
    steps,
    inputData,
    playbackState,
    hasUnsavedChanges,
    markChangesSaved,
  } = usePlaygroundStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  // Sync playground state to session store
  useEffect(() => {
    if (algorithmSlug && hasUnsavedChanges) {
      updateSession({
        algorithmSlug: algorithmSlug as AlgorithmSlug,
        currentStep: currentStepIndex,
        totalSteps: steps.length,
        inputData,
        visualState: { playbackState },
        isCompleted: playbackState === 'completed',
      });
    }
  }, [
    algorithmSlug,
    currentStepIndex,
    steps.length,
    inputData,
    playbackState,
    hasUnsavedChanges,
    updateSession,
  ]);

  // Manual save function
  const save = useCallback(async () => {
    if (!currentSession || isSyncing) return;

    try {
      await saveSession();
      markChangesSaved();
      lastSaveRef.current = Date.now();
      onSave?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to save');
    }
  }, [currentSession, isSyncing, saveSession, markChangesSaved, onSave, onError]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled || !currentSession) return;

    intervalRef.current = setInterval(() => {
      if (hasPendingChanges && !isSyncing) {
        save();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, hasPendingChanges, isSyncing, currentSession, save]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges) {
        // Try to save synchronously
        navigator.sendBeacon?.(
          '/api/sessions',
          JSON.stringify({
            algorithmSlug: currentSession?.algorithmSlug,
            currentStep: currentSession?.currentStep,
            totalSteps: currentSession?.totalSteps,
            inputData: currentSession?.inputData,
            visualState: currentSession?.visualState,
            isCompleted: currentSession?.isCompleted,
          })
        );
        
        // Show warning
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingChanges, currentSession]);

  // Handle sync errors
  useEffect(() => {
    if (syncError) {
      onError?.(syncError);
    }
  }, [syncError, onError]);

  return {
    save,
    isSaving: isSyncing,
    hasPendingChanges,
    lastSaved: lastSaveRef.current,
    error: syncError,
  };
}

/**
 * Hook for loading a saved session
 */
export function useLoadSession(algorithmSlug: AlgorithmSlug | null) {
  const { loadSession, currentSession, isSyncing } = useSessionStore();
  const { initializePlayground } = usePlaygroundStore();

  const load = useCallback(async () => {
    if (!algorithmSlug) return null;

    const session = await loadSession(algorithmSlug);
    return session;
  }, [algorithmSlug, loadSession]);

  // Restore playground state from session
  const restore = useCallback(
    (session: NonNullable<typeof currentSession>) => {
      if (!session) return;

      initializePlayground({
        algorithmSlug: session.algorithmSlug,
        algorithmName: '', // Will be set by the playground component
        steps: [], // Will be regenerated
        inputData: session.inputData,
        startingStep: session.currentStep,
        sessionId: undefined,
      });
    },
    [initializePlayground]
  );

  return {
    load,
    restore,
    isLoading: isSyncing,
    session: currentSession,
  };
}
