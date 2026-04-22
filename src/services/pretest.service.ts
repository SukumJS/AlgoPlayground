import api from "./api";
import type { UserAnswer } from "@/src/app/types/quiz";

// ── Types matching backend response ──────────────────────────────

/** Response from GET /pretests/:algorithm (no correct answers) */
export interface PretestQuizData {
  id: string;
  title: string;
  questions: {
    id: string;
    question: string;
    questionImage?: string;
    choices: { id: string; label: string; text: string }[];
  }[];
  savedAnswers?: { questionId: string; selectedChoiceId: string }[];
}

/** Response from POST /pretests/:algorithm/submit */
export interface PretestGradingResult {
  score: number;
  totalQuestions: number;
  results: { questionId: string; isCorrect: boolean }[];
}

/** Response from GET /pretests/:algorithm/status */
export interface PretestStatus {
  completed: boolean;
  inProgress: boolean;
  score?: number;
  total?: number;
  answeredCount?: number;
}

// ── API response wrapper ─────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ── Service ──────────────────────────────────────────────────────

export const pretestService = {
  /** GET /pretests/:algorithm — fetch pretest questions (resumes progress) */
  getPretestByAlgorithm: (algorithm: string) =>
    api.get<ApiResponse<PretestQuizData>>(`/pretests/${algorithm}`),

  /** POST /pretests/:algorithm/submit — submit answers for grading */
  submitPretestAnswers: (algorithm: string, answers: UserAnswer[]) =>
    api.post<ApiResponse<PretestGradingResult>>(
      `/pretests/${algorithm}/submit`,
      {
        answers: answers.map((a) => ({
          questionId: a.questionId,
          selectedChoiceId: a.selectedChoiceId || "",
        })),
      },
    ),

  /** GET /pretests/:algorithm/status — check pretest state */
  checkPretestStatus: (algorithm: string) =>
    api.get<ApiResponse<PretestStatus>>(`/pretests/${algorithm}/status`),

  /** PUT /pretests/:algorithm/progress — auto-save partial answers */
  savePretestProgress: (algorithm: string, answers: UserAnswer[]) =>
    api.put<ApiResponse<{ saved: boolean }>>(
      `/pretests/${algorithm}/progress`,
      {
        questionIds: answers.map((answer) => answer.questionId),
        // Send only answered items for partial-save endpoint.
        // Empty choice ids can fail backend validation and cause 500.
        answers: answers
          .filter(
            (a) =>
              typeof a.selectedChoiceId === "string" &&
              a.selectedChoiceId.length > 0,
          )
          .map((a) => ({
            questionId: a.questionId,
            selectedChoiceId: a.selectedChoiceId as string,
          })),
      },
    ),
};
