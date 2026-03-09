import api from "./api";

// ── Payloads ──────────────────────────────────────────────────────

export interface LoginPayload {
  identifier: string; // email or username
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

// ── Responses ─────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

// ── Service ───────────────────────────────────────────────────────

export const authService = {
  /** POST /auth/login */
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload),

  /** POST /auth/register */
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload),

  /** POST /auth/logout */
  logout: () => api.post("/auth/logout"),

  /** GET /auth/me — validate session / get current user */
  getMe: () => api.get<AuthUser>("/auth/me"),

  /** POST /auth/refresh — refresh access token */
  refreshToken: () => api.post<{ accessToken: string }>("/auth/refresh"),
};
