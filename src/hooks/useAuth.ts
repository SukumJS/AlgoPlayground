"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/src/config/firebase";
import {
  authService,
  type SyncUserResponse,
} from "@/src/services/auth.service";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SyncUserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        localStorage.setItem("access_token", idToken);

        try {
          const res = await authService.sync();
          setProfile(res.data.data.user);
        } catch {
          setProfile(null);
        }
      } else {
        localStorage.removeItem("access_token");
        setProfile(null);
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}
