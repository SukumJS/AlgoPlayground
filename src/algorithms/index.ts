import type { AlgorithmRunner } from "../types/algorithm";
import { dijkstraRunner } from "./dijkstra";

/**
 * Algorithm registry – maps URL slug to its runner.
 * Add new algorithms here as they are implemented.
 */
const algorithmRegistry: Record<string, AlgorithmRunner> = {
  dijkstra: dijkstraRunner,
};

export function getAlgorithmRunner(slug: string): AlgorithmRunner | undefined {
  return algorithmRegistry[slug];
}

export default algorithmRegistry;
