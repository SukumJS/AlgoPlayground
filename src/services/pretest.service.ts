import api from "./api";
import type { QuizData, UserAnswer } from "@/src/app/types/quiz";

// ── Types ─────────────────────────────────────────────────────────

export interface PretestResult {
  score: number;
  totalQuestions: number;
  answers: UserAnswer[];
}

// ── Service ───────────────────────────────────────────────────────

export const pretestService = {
  /** GET /pretests/:algorithm — fetch pretest questions */
  getPretestByAlgorithm: (algorithm: string) =>
    api.get<QuizData>(`/pretests/${algorithm}`),

  /** POST /pretests/:algorithm/answers — submit user answers */
  submitPretestAnswers: (algorithm: string, answers: UserAnswer[]) =>
    api.post<PretestResult>(`/pretests/${algorithm}/answers`, { answers }),

  /** PUT /pretests/:algorithm/result — save final result */
  savePretestResult: (algorithm: string, result: PretestResult) =>
    api.put(`/pretests/${algorithm}/result`, result),
};
