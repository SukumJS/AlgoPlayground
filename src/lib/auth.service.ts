import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import { saveAuthSession, type AuthUserProfile } from "./auth-storage";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface SignupRequest {
  email: string;
  password: string;
  username?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  id?: string;
  uid?: string;
  email?: string;
  imageUrl?: string;
  updatedAt?: string;
}

interface ProfileImageUploadResponse {
  imageUrl?: string;
  data?: {
    imageUrl?: string;
  };
  message?: string;
}

type SyncPayload = {
  user?: AuthResponse;
  data?: {
    user?: AuthResponse;
  };
  id?: string;
  uid?: string;
  email?: string;
  imageUrl?: string;
  updatedAt?: string;
};

function normalizeSyncUser(payload: SyncPayload): AuthResponse {
  return (
    payload.data?.user ||
    payload.user || {
      id: payload.id,
      uid: payload.uid,
      email: payload.email,
      imageUrl: payload.imageUrl,
      updatedAt: payload.updatedAt,
    }
  );
}

export async function syncUserWithBackend(
  idToken: string,
): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND_URL}/auth/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let message = "Failed to sync user";
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // Keep default message if backend does not return JSON.
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as SyncPayload;
  const user = normalizeSyncUser(payload);
  saveAuthSession(idToken, user as AuthUserProfile);
  return user;
}

export async function signup(request: SignupRequest): Promise<AuthResponse> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    request.email,
    request.password,
  );

  if (request.username?.trim()) {
    await updateProfile(userCredential.user, {
      displayName: request.username.trim(),
    });
  }

  const idToken = await userCredential.user.getIdToken(true);
  return syncUserWithBackend(idToken);
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    request.email,
    request.password,
  );
  const idToken = await userCredential.user.getIdToken(true);
  return syncUserWithBackend(idToken);
}

export async function googleSignIn(): Promise<AuthResponse | null> {
  const provider = new GoogleAuthProvider();

  try {
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken(true);
    return syncUserWithBackend(idToken);
  } catch {
    // Fallback to redirect flow if popup is blocked by browser policy.
    await signInWithRedirect(auth, provider);
    return null;
  }
}

export async function updateProfileImage(
  file: File,
  token: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("profileImage", file);

  const response = await fetch(`${BACKEND_URL}/user/profile-image`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to update profile image";
    try {
      const error = (await response.json()) as ProfileImageUploadResponse;
      message = error.message || message;
    } catch {
      // Keep default message if backend does not return JSON.
    }

    throw new Error(message);
  }

  const payload = (await response.json()) as ProfileImageUploadResponse;
  const imageUrl = payload.data?.imageUrl || payload.imageUrl;

  if (!imageUrl) {
    throw new Error(
      "Profile image upload succeeded but no imageUrl was returned",
    );
  }

  return imageUrl;
}
