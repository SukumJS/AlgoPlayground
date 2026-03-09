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

// ── Service ───────────────────────────────────────────────────────

export const posttestService = {
  /** GET /posttests/:algorithm — fetch posttest questions */
  getPosttestByAlgorithm: (algorithm: string) =>
    api.get<PosttestData>(`/posttests/${algorithm}`),

  /** POST /posttests/:algorithm/answers — submit user answers */
  submitPosttestAnswers: (algorithm: string, answers: PosttestUserAnswer[]) =>
    api.post<PosttestResult>(`/posttests/${algorithm}/answers`, { answers }),

  /** PUT /posttests/:algorithm/result — save final result */
  savePosttestResult: (algorithm: string, result: PosttestResult) =>
    api.put(`/posttests/${algorithm}/result`, result),
};
