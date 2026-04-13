import api from "./api";
import type { Status } from "@/src/data/algorithmCatalog";

// ── Types ─────────────────────────────────────────────────────────

export interface TestStatus {
  status: Status;
  score?: number;
  totalCount: number;
  answeredCount?: number;
}

export interface AlgorithmProgress {
  pretest: TestStatus;
  posttest: TestStatus;
}

/** Backend response: map of algorithm slug → progress */
export type AllProgressData = Record<string, AlgorithmProgress>;

export interface UserProgress {
  algorithmSlug: string;
  pretest: TestStatus;
  posttest: TestStatus;
}

export interface TestResultHistory {
  id: string;
  algorithm: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

// ── API response wrapper ─────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ── Service ───────────────────────────────────────────────────────

export const progressService = {
  /** GET /progress/all — batch fetch all pretest + posttest statuses */
  getAllProgress: () => api.get<ApiResponse<AllProgressData>>("/progress/all"),

  /** GET /users/:userId/progress */
  getUserProgress: (userId: string) =>
    api.get<UserProgress[]>(`/users/${userId}/progress`),

  /** GET /users/:userId/pretest-results */
  getPretestResults: (userId: string) =>
    api.get<TestResultHistory[]>(`/users/${userId}/pretest-results`),

  /** GET /users/:userId/posttest-results */
  getPosttestResults: (userId: string) =>
    api.get<TestResultHistory[]>(`/users/${userId}/posttest-results`),
};
