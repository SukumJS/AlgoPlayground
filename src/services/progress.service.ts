import api from "./api";
import type { Status } from "@/src/data/algorithmCatalog";

// ── Types ─────────────────────────────────────────────────────────

export interface UserProgress {
  algorithmSlug: string;
  pretest: {
    status: Status;
    score?: number;
    answeredCount?: number;
    totalCount: number;
  };
  posttest: {
    status: Status;
    score?: number;
    answeredCount?: number;
    totalCount: number;
  };
}

export interface TestResultHistory {
  id: string;
  algorithm: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

// ── Service ───────────────────────────────────────────────────────

export const progressService = {
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
