import api from "./api";
import type { AlgorithmSectionData } from "@/src/data/algorithmCatalog";

// ── Types ─────────────────────────────────────────────────────────

export interface ReadingContent {
  id: string;
  algorithm: string;
  title: string;
  sections: Array<{
    heading: string;
    content?: string[];
    list?: string[];
    code?: { language: string; value: string };
  }>;
}

// ── Service ───────────────────────────────────────────────────────

export const algorithmService = {
  /** GET /algorithms — fetch algorithm catalog (sections + items) */
  getAlgorithmCatalog: () => api.get<AlgorithmSectionData[]>("/algorithms"),

  /** GET /algorithms/:algorithm/reading — fetch reading content */
  getReadingContent: (algorithm: string) =>
    api.get<ReadingContent>(`/algorithms/${algorithm}/reading`),
};
