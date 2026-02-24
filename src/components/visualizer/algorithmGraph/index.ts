import type { AlgorithmRunner } from "../types/algorithm";
import { dijkstraRunner } from "./dijkstra";
import { bfsRunner } from "./bfs";
import { dfsRunner } from "./dfs";
import { primsRunner } from "./prims";
import { kruskalsRunner } from "./kruskals";

/**
 * Algorithm registry – maps URL slug to its runner.
 * Add new algorithms here as they are implemented.
 */
const algorithmRegistry: Record<string, AlgorithmRunner> = {
  dijkstra: dijkstraRunner,
  "breadth-first-search": bfsRunner,
  "depth-first-search": dfsRunner,
  prims: primsRunner,
  kruskals: kruskalsRunner,
};

export function getAlgorithmRunner(slug: string): AlgorithmRunner | undefined {
  return algorithmRegistry[slug];
}

export default algorithmRegistry;
