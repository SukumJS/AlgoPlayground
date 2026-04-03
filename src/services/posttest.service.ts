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

// ── API response wrapper ─────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ── Service ───────────────────────────────────────────────────────

export const posttestService = {
  /** GET /posttests/:algorithm — fetch posttest questions (random 5, ≥1 per type) */
  getPosttestByAlgorithm: (algorithm: string) =>
    api.get<ApiResponse<PosttestData>>(`/posttests/${algorithm}`),
};
