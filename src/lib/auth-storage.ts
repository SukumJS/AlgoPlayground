export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_USER_KEY = "authUser";

export interface AuthUserProfile {
  id?: string;
  uid?: string;
  email?: string;
  imageUrl?: string;
  updatedAt?: string;
}

export function saveAuthSession(token: string, user?: AuthUserProfile) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUserProfile | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUserProfile;
  } catch {
    return null;
  }
}
