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

/** Response shape from /pretests/:algorithm/status and /posttests/:algorithm/status */
export interface AlgorithmTestStatusResponse {
  completed: boolean;
  inProgress: boolean;
  score?: number;
  total?: number;
  answeredCount?: number;
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

  /**
   * GET /pretests/:algorithm/status
   * Single algorithm pretest status (completed/in-progress/score)
   */
  getPretestStatus: (algorithm: string) =>
    api.get<ApiResponse<AlgorithmTestStatusResponse>>(
      `/pretests/${algorithm}/status`,
    ),

  /**
   * GET /posttests/:algorithm/status
   * Single algorithm posttest status (completed/in-progress/score)
   */
  getPosttestStatus: (algorithm: string) =>
    api.get<ApiResponse<AlgorithmTestStatusResponse>>(
      `/posttests/${algorithm}/status`,
    ),

  /** GET /users/:userId/progress (legacy endpoint) */
  getUserProgress: (userId: string) =>
    api.get<UserProgress[]>(`/users/${userId}/progress`),

  /** GET /users/:userId/pretest-results (legacy endpoint) */
  getPretestResults: (userId: string) =>
    api.get<TestResultHistory[]>(`/users/${userId}/pretest-results`),

  /** GET /users/:userId/posttest-results (legacy endpoint) */
  getPosttestResults: (userId: string) =>
    api.get<TestResultHistory[]>(`/users/${userId}/posttest-results`),
};
