import api from "./api";

// ── Responses ─────────────────────────────────────────────────────

/** Shape returned by POST /auth/sync */
export interface SyncUserResponse {
  id: string;
  imageUrl: string;
  updatedAt: string;
  email: string;
}

// ── Service ───────────────────────────────────────────────────────

export const authService = {
  /** POST /auth/sync - sync user from Firebase to backend, returns profile data */
  sync: () =>
    api.post<{
      success: boolean;
      data: { message: string; user: SyncUserResponse };
    }>("/auth/sync"),
};
