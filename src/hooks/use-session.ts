'use client';

import { useAuth } from '@/contexts/auth-context';

/**
 * Hook to check if user is authenticated
 * Provides session state without the full auth context
 */
export function useSession() {
  const { user, session, isLoading, isAuthenticated } = useAuth();

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    status: isLoading
      ? 'loading'
      : isAuthenticated
        ? 'authenticated'
        : 'unauthenticated',
  } as const;
}

/**
 * Hook to get the current user
 * Returns null if not authenticated
 */
export function useCurrentUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}
