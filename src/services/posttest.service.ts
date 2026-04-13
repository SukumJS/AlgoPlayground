import api from "./api";
import type {
  PosttestData,
  PosttestUserAnswer,
} from "@/src/app/types/posttest";

// ── Types ─────────────────────────────────────────────────────────

export interface PosttestResult {
  score: number;
  totalQuestions: number;
  answers: PosttestUserAnswer[];
}

export interface PosttestStatus {
  completed?: boolean;
  inProgress?: boolean;
  answeredCount?: number;
  total?: number;
  score?: number;
}

// ── Service ───────────────────────────────────────────────────────

export const posttestService = {
  /** GET /posttests/:algorithm — fetch posttest questions */
  getPosttestByAlgorithm: (algorithm: string) =>
    api.get<PosttestData>(`/posttests/${algorithm}`),

  /** POST /posttests/:algorithm/submit — submit user answers for grading */
  submitPosttestAnswers: (algorithm: string, answers: PosttestUserAnswer[]) =>
    api.post<PosttestResult>(`/posttests/${algorithm}/submit`, { answers }),

  /** PUT /posttests/:algorithm/progress — auto-save partial answers */
  savePosttestProgress: (algorithm: string, answers: PosttestUserAnswer[]) =>
    api.put(`/posttests/${algorithm}/progress`, { answers }),

  /** GET /posttests/:algorithm/status — check posttest state */
  getPosttestStatus: (algorithm: string) =>
    api.get<PosttestStatus>(`/posttests/${algorithm}/status`),
};
