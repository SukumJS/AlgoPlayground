import api from "./api";
import type { Exercise } from "@/src/app/types/exercise";

// ── Service ───────────────────────────────────────────────────────

export const exerciseService = {
  /** GET /exercises — list exercises, optionally filtered by difficulty */
  getExercises: (filter?: { difficulty?: string }) =>
    api.get<Exercise[]>("/exercises", { params: filter }),

  /** GET /exercises/:algorithm — get exercises for a specific algorithm */
  getExercisesByAlgorithm: (algorithm: string) =>
    api.get<Exercise[]>(`/exercises/${algorithm}`),
};
