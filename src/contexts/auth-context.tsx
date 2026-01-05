'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';

// ===========================================
// Types
// ===========================================

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

// ===========================================
// Context
// ===========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===========================================
// Provider
// ===========================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Transform Firebase user to our AuthUser type
  const transformUser = useCallback((fbUser: User | null): AuthUser | null => {
    if (!fbUser) return null;

    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      avatarUrl: fbUser.photoURL || undefined,
    };
  }, []);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log('Firebase auth state changed:', fbUser?.uid);

      setFirebaseUser(fbUser);
      setUser(transformUser(fbUser));
      setIsLoading(false);

      // If user just signed in, create session cookie
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          // Create session cookie via API
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          router.refresh();
        } catch (error) {
          console.error('Error creating session:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [router, transformUser]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Clear session cookie via API
      await fetch('/api/auth/signout', { method: 'POST' });
      
      // Clear state
      setUser(null);
      setFirebaseUser(null);
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Get ID token for API calls
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    
    try {
      return await firebaseUser.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }, [firebaseUser]);

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!firebaseUser && !!user,
    signOut,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ===========================================
// Hook
// ===========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// ===========================================
// Utility Hook - Require Auth
// ===========================================

export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}
