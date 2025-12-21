'use client';

import { useEffect, useState } from 'react';
import { AlgorithmMetadata } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { usePlaygroundStore } from '@/stores';
import { useAutoSave, useLoadSession } from '@/hooks';
import { Playground, PlaygroundHeader, PlaygroundSkeleton } from '@/components/playground';
import { notify } from '@/stores';

// ===========================================
// Types
// ===========================================

interface PlaygroundClientProps {
  algorithm: AlgorithmMetadata;
}

// ===========================================
// Playground Client Component
// ===========================================

export function PlaygroundClient({ algorithm }: PlaygroundClientProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isRestoring, setIsRestoring] = useState(false);
  const { hasUnsavedChanges } = usePlaygroundStore();

  // Session loading
  const { load: loadSession, isLoading: sessionLoading } = useLoadSession(algorithm.slug);

  // Auto-save hook
  const { save, isSaving, lastSaved, error: saveError } = useAutoSave({
    enabled: isAuthenticated,
    interval: 30000, // 30 seconds
    onSave: () => {
      // Optional: show notification
    },
    onError: (error) => {
      notify.error('Failed to save', error);
    },
  });

  // Restore session on mount (for authenticated users)
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isRestoring) {
      setIsRestoring(true);
      loadSession().then((session) => {
        if (session) {
          notify.info('Session Restored', 'Your previous progress has been loaded.');
        }
        setIsRestoring(false);
      }).catch(() => {
        setIsRestoring(false);
      });
    }
  }, [authLoading, isAuthenticated, loadSession, isRestoring]);

  // Show save error
  useEffect(() => {
    if (saveError) {
      notify.error('Save Error', saveError);
    }
  }, [saveError]);

  const isLoading = authLoading || sessionLoading || isRestoring;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <PlaygroundHeader
        algorithm={algorithm}
        isSaving={isSaving}
        lastSaved={lastSaved ? new Date(lastSaved) : null}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={save}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-hidden">
        {isLoading ? (
          <PlaygroundSkeleton />
        ) : (
          <Playground
            algorithm={algorithm}
            className="h-full"
          />
        )}
      </main>
    </div>
  );
}
