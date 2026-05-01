"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/src/config/firebase";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  type AuthUserProfile,
} from "@/src/lib/auth-storage";

export function useAuth() {
  const [user, setUser] = useState<AuthUserProfile | null>(() =>
    getStoredUser(),
  );
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        clearAuthSession();
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
        setUser(null);
        setFirebaseUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const idToken = await fbUser.getIdToken();
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", idToken);
      }

      const storedUser = getStoredUser();
      setUser(storedUser);
      setFirebaseUser(fbUser);
      setToken(idToken);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Listen for profile updates from other components (e.g., profile page avatar changes)
  useEffect(() => {
    const handleProfileUpdate = () => {
      const updatedUser = getStoredUser();
      setUser(updatedUser);
    };

    window.addEventListener("authProfileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("authProfileUpdated", handleProfileUpdate);
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    clearAuthSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    setUser(null);
    setFirebaseUser(null);
    setToken(null);
  };

  return {
    user,
    firebaseUser,
    token,
    loading,
    logout,
  };
}
