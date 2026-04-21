import api from "./api";
import type { SyncUserResponse } from "./auth.service";

// ── Types ─────────────────────────────────────────────────────────

/** Profile data from /auth/sync — use this as the source of truth for user info */
export type UserProfile = SyncUserResponse;

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Service ───────────────────────────────────────────────────────

export const userService = {
  /** GET /users/:id */
  getUserById: (id: string) => api.get<UserProfile>(`/users/${id}`),

  /** PUT /users/:id — update username / email */
  updateProfile: (id: string, payload: UpdateProfilePayload) =>
    api.put<UserProfile>(`/users/${id}`, payload),

  /** PUT /user/profile-image — upload new profile picture */
  updateProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    return api.put<{ message: string; imageUrl: string }>(
      "/user/profile-image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },

  /** PUT /users/:id/password — change password */
  changePassword: (id: string, payload: ChangePasswordPayload) =>
    api.put(`/users/${id}/password`, payload),
};
