"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  getRedirectResult,
  onIdTokenChanged,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/src/lib/firebase";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
  type AuthUserProfile,
} from "@/src/lib/auth-storage";
import { syncUserWithBackend } from "@/src/lib/auth.service";

type AuthContextValue = {
  isLoggedIn: boolean;
  token: string | null;
  user: AuthUserProfile | null;
  firebaseUser: User | null;
  updateUser: (nextUser: AuthUserProfile) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUserProfile | null>(() =>
    getStoredUser(),
  );
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(token));
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleRedirectResult = async () => {
      const result = await getRedirectResult(auth);
      if (!result?.user) {
        return;
      }

      const nextToken = await result.user.getIdToken(true);
      setFirebaseUser(result.user);
      setToken(nextToken);

      try {
        const backendUser = await syncUserWithBackend(nextToken);
        saveAuthSession(nextToken, backendUser);
        setUser(backendUser);
      } catch (error) {
        console.error("Failed to sync redirect user:", error);
      } finally {
        setIsLoggedIn(true);
        if (pathname?.startsWith("/auth")) {
          window.location.replace("/");
        }
      }
    };

    void handleRedirectResult();

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);

      if (!nextUser) {
        clearAuthSession();
        setIsLoggedIn(false);
        setToken(null);
        setUser(null);
        return;
      }

      const nextToken = await nextUser.getIdToken();
      const storedUser = getStoredUser();
      setToken(nextToken);

      if (storedUser && storedUser.uid === nextUser.uid) {
        saveAuthSession(nextToken, storedUser);
        setUser(storedUser);
        setIsLoggedIn(true);
        if (pathname?.startsWith("/auth")) {
          window.location.replace("/");
        }
        return;
      }

      try {
        const backendUser = await syncUserWithBackend(nextToken);
        saveAuthSession(nextToken, backendUser);
        setUser(backendUser);
      } catch (error) {
        console.error("Failed to sync auth user:", error);
      } finally {
        setIsLoggedIn(true);
        if (pathname?.startsWith("/auth")) {
          window.location.replace("/");
        }
      }
    });

    return () => unsubscribe();
  }, [pathname]);

  useEffect(() => {
    if (isLoggedIn && pathname?.startsWith("/auth")) {
      window.location.replace("/");
    }
  }, [isLoggedIn, pathname]);

  const logout = async () => {
    await signOut(auth);
    clearAuthSession();
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
  };

  const updateUser = useCallback(
    (nextUser: AuthUserProfile) => {
      setUser(nextUser);
      if (token) {
        saveAuthSession(token, nextUser);
      }
    },
    [token],
  );

  const value = useMemo(
    () => ({ isLoggedIn, token, user, firebaseUser, updateUser, logout }),
    [isLoggedIn, token, user, firebaseUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
