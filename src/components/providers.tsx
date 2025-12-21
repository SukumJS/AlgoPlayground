'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Client-side providers wrapper
 * Wraps the app with all necessary context providers
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
