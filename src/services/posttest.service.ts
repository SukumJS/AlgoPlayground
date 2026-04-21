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
  algorithm?: string;
  completed: boolean;
  inProgress: boolean;
  score: number | null;
  total: number | null;
  answeredCount: number | null;
  reminderShown: boolean;
  reminderShownAt: string | null;
  updatedAt?: string;
}

export type ReminderSeenSource =
  | "maybe-later"
  | "posttest-completed"
  | "system-sync";

export interface ReminderStateDTO {
  algorithm: string;
  reminderShown: boolean;
  reminderShownAt: string | null;
  updatedAt?: string;
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
      {
        questionIds: answers.map((answer) => answer.questionId),
        // Only persist actual answers; empty placeholders can trip backend validation.
        answers: answers.filter((answer) => {
          switch (answer.type) {
            case "multiple_choice":
              return (
                answer.selectedChoiceId !== null &&
                answer.selectedChoiceId !== undefined &&
                answer.selectedChoiceId !== ""
              );
            case "fill_blank":
              return (answer.filledAnswer || "").trim().length > 0;
            case "ordering":
              return (answer.orderedItems || []).length > 0;
            default:
              return false;
          }
        }),
      },
    ),

  /** GET /posttests/:algorithm/status — check posttest state */
  checkPosttestStatus: (algorithm: string) =>
    api.get<ApiResponse<PosttestStatus>>(`/posttests/${algorithm}/status`),

  /** PATCH /posttests/:algorithm/reminder-seen — mark reminder as seen */
  markReminderSeen: (
    algorithm: string,
    payload: { seen: true; source?: ReminderSeenSource } = {
      seen: true,
      source: "maybe-later",
    },
  ) =>
    api.patch<ApiResponse<ReminderStateDTO>>(
      `/posttests/${algorithm}/reminder-seen`,
      payload,
    ),

  /** PATCH /posttests/:algorithm/reminder-reset — test-only reset endpoint */
  resetReminderState: (
    algorithm: string,
    payload: { reset: true } = { reset: true },
  ) =>
    api.patch<ApiResponse<ReminderStateDTO>>(
      `/posttests/${algorithm}/reminder-reset`,
      payload,
    ),
};
