import api from "./api";
import type { Exercise } from "@/src/app/types/exercise";

// ── Service ───────────────────────────────────────────────────────

export const exerciseService = {
  /** GET /exercises — list exercises, optionally filtered by difficulty */
  getExercises: (filter?: { difficulty?: string }) =>
    api.get<Exercise[]>("/exercise", { params: filter }),
};
