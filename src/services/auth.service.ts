import api from "./api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/src/config/firebase";
import { saveAuthSession, type AuthUserProfile } from "@/src/lib/auth-storage";

// ── Responses ─────────────────────────────────────────────────────

/** Shape returned by POST /auth/sync */
export interface SyncUserResponse {
  id?: string;
  uid?: string;
  imageUrl?: string;
  updatedAt?: string;
  email?: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

// ── Service ───────────────────────────────────────────────────────

export const authService = {
  /** POST /auth/sync - sync user from Firebase to backend, returns profile data */
  sync: () =>
    api.post<{
      success: boolean;
      data: { message: string; user: SyncUserResponse };
    }>("/auth/sync"),
};

interface ProfileImageUploadResponse {
  imageUrl?: string;
  data?: {
    imageUrl?: string;
  };
  message?: string;
}

type SyncPayload = {
  user?: SyncUserResponse;
  data?: {
    user?: SyncUserResponse;
  };
  id?: string;
  uid?: string;
  email?: string;
  imageUrl?: string;
  updatedAt?: string;
};

function normalizeSyncUser(payload: SyncPayload): SyncUserResponse {
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
): Promise<SyncUserResponse> {
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

export async function updateProfileImage(
  file: File,
  token: string,
  userId?: string,
): Promise<string> {
  let firebaseImageUrl: string | null = null;

  try {
    if (userId) {
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const storageRef = ref(
        storage,
        `profileImages/${userId}/${timestamp}.${fileExtension}`,
      );
      await uploadBytes(storageRef, file);
      firebaseImageUrl = await getDownloadURL(storageRef);
    }
  } catch {
    // Continue with backend upload even if Firebase upload fails.
  }

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
  const backendImageUrl = payload.data?.imageUrl || payload.imageUrl;
  const imageUrl = firebaseImageUrl || backendImageUrl;

  if (!imageUrl) {
    throw new Error(
      "Profile image upload succeeded but no imageUrl was returned",
    );
  }

  return imageUrl;
}
