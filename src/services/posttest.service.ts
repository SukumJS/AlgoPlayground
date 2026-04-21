import api from "./api";
import type {
  PosttestUserAnswer,
  OrderingCanvasData,
} from "@/src/app/types/posttest";

// ── Types matching backend response ──────────────────────────────

/** A single choice for multiple_choice questions */
export interface PosttestChoiceDTO {
  id: string;
  label: string;
  text: string;
}

/** A draggable item for ordering questions */
export interface PosttestOrderItemDTO {
  id: string;
  label: string;
}

/** One posttest question from the backend (no correct answers) */
export interface PosttestQuestionDTO {
  id: string;
  type: "multiple_choice" | "fill_blank" | "ordering";
  title: string;
  text: string;
  questionImage?: string;
  question: {
    multipleChoice?: {
      choices: PosttestChoiceDTO[];
    };
    items?: PosttestOrderItemDTO[];
    canvasData?: OrderingCanvasData;
  };
}

/** Full posttest response */
export interface PosttestDataDTO {
  id: string;
  title: string;
  questions: PosttestQuestionDTO[];
  savedAnswers?: PosttestUserAnswer[];
}

/** One question's grading result (includes correct answer for result page) */
export interface PosttestQuestionResult {
  questionId: string;
  type: "multiple_choice" | "fill_blank" | "ordering";
  isCorrect: boolean;
  correctChoiceId?: string;
  correctAnswer?: string;
  correctOrder?: string[];
}

/** Grading response */
export interface PosttestGradingResult {
  score: number;
  totalQuestions: number;
  results: PosttestQuestionResult[];
}

/** Status response */
export interface PosttestStatus {
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

export const posttestService = {
  /** GET /posttests/:algorithm — fetch questions (resumes progress) */
  getPosttestByAlgorithm: (algorithm: string) =>
    api.get<ApiResponse<PosttestDataDTO>>(`/posttests/${algorithm}`),

  /** POST /posttests/:algorithm/submit — submit for grading */
  submitPosttestAnswers: (algorithm: string, answers: PosttestUserAnswer[]) =>
    api.post<ApiResponse<PosttestGradingResult>>(
      `/posttests/${algorithm}/submit`,
      { answers },
    ),

  /** PUT /posttests/:algorithm/progress — auto-save partial answers */
  savePosttestProgress: (algorithm: string, answers: PosttestUserAnswer[]) =>
    api.put<ApiResponse<{ saved: boolean }>>(
      `/posttests/${algorithm}/progress`,
      { answers },
    ),

  /** GET /posttests/:algorithm/status — check posttest state */
  checkPosttestStatus: (algorithm: string) =>
    api.get<ApiResponse<PosttestStatus>>(`/posttests/${algorithm}/status`),
};
