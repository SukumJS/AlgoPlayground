import api from "./api";

// ── Types ─────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

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

  /** PUT /users/:id/avatar — upload profile image */
  updateProfileImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.put<UserProfile>(`/users/${id}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** PUT /users/:id/password — change password */
  changePassword: (id: string, payload: ChangePasswordPayload) =>
    api.put(`/users/${id}/password`, payload),
};
