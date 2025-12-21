import { AlgorithmStep, Graph } from '@/types';
import {
  createStep,
  resetStepCounter,
  AlgorithmCode,
} from '../base';
import {
  GraphInput,
  createGraph,
  updateNodeStates,
  updateEdgeStates,
  getNeighbors,
  getEdgeBetween,
  buildAdjacencyList,
} from './graph-helpers';

// ===========================================
// BFS Input Type
// ===========================================

export interface BFSInput {
  graph: GraphInput;
  startNode: string;
  targetNode?: string; // Optional: for pathfinding
}

// ===========================================
// BFS Step Generator
// ===========================================

export function generateBFSSteps(input: BFSInput): AlgorithmStep[] {
  resetStepCounter();
  const steps: AlgorithmStep[] = [];
  let graph = createGraph(input.graph);
  const { startNode, targetNode } = input;
  
  const visited = new Set<string>();
  const queue: string[] = [];
  const visitOrder: string[] = [];
  const parents = new Map<string, string | null>();
  
  // Initial state
  steps.push(
    createStep('initialize', `Starting BFS from node ${startNode}`, {
      graph,
      currentNode: startNode,
      queue: [],
      visitedNodes: [],
      message: targetNode 
        ? `Finding path from ${startNode} to ${targetNode}` 
        : `Traversing all reachable nodes from ${startNode}`,
    }, [1])
  );

  // Mark start node as visited and add to queue
  visited.add(startNode);
  queue.push(startNode);
  parents.set(startNode, null);

  graph = updateNodeStates(graph, [
    { nodeIds: [startNode], state: 'current' },
  ]);

  steps.push(
    createStep('visit', `Enqueue starting node ${startNode}`, {
      graph,
      currentNode: startNode,
      queue: [...queue],
      visitedNodes: [...visited],
      message: `Added ${startNode} to queue. Queue: [${queue.join(', ')}]`,
    }, [2, 3])
  );

  // BFS loop
  while (queue.length > 0) {
    const current = queue.shift()!;
    visitOrder.push(current);

    // Update visualization - current node
    graph = updateNodeStates(graph, [
      { nodeIds: [current], state: 'current' },
      { nodeIds: [...visited].filter(n => n !== current), state: 'visited' },
    ]);

    steps.push(
      createStep('visit', `Dequeue and process node ${current}`, {
        graph,
        currentNode: current,
        queue: [...queue],
        visitedNodes: [...visited],
        message: `Processing ${current}. Queue: [${queue.join(', ') || 'empty'}]`,
      }, [4, 5])
    );

    // Check if target found
    if (targetNode && current === targetNode) {
      // Reconstruct path
      const path: string[] = [];
      let node: string | null | undefined = targetNode;
      while (node !== null && node !== undefined) {
        path.unshift(node);
        node = parents.get(node);
      }

      // Highlight path
      const pathEdgeIds: string[] = [];
      for (let i = 0; i < path.length - 1; i++) {
        const edge = getEdgeBetween(graph, path[i], path[i + 1]);
        if (edge) pathEdgeIds.push(edge.id);
      }

      graph = updateNodeStates(graph, [
        { nodeIds: path, state: 'path' },
        { nodeIds: [...visited].filter(n => !path.includes(n)), state: 'visited' },
      ]);
      graph = updateEdgeStates(graph, [
        { edgeIds: pathEdgeIds, state: 'path' },
      ]);

      steps.push(
        createStep('found', `Found target ${targetNode}! Path: ${path.join(' → ')}`, {
          graph,
          currentNode: targetNode,
          queue: [...queue],
          visitedNodes: [...visited],
          message: `Shortest path (${path.length - 1} edges): ${path.join(' → ')}`,
          parents: Object.fromEntries(parents),
        }, [6])
      );

      return steps;
    }

    // Get neighbors
    const neighbors = getNeighbors(graph, current);

    steps.push(
      createStep('initialize', `Checking neighbors of ${current}: [${neighbors.join(', ')}]`, {
        graph,
        currentNode: current,
        queue: [...queue],
        visitedNodes: [...visited],
        message: `Node ${current} has ${neighbors.length} neighbor(s)`,
      }, [7])
    );

    // Process each neighbor
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        parents.set(neighbor, current);

        // Highlight edge being explored
        const edge = getEdgeBetween(graph, current, neighbor);
        if (edge) {
          graph = updateEdgeStates(graph, [
            { edgeIds: [edge.id], state: 'current' },
          ]);
        }

        graph = updateNodeStates(graph, [
          { nodeIds: [current], state: 'current' },
          { nodeIds: [neighbor], state: 'highlight' },
          { nodeIds: [...visited].filter(n => n !== current && n !== neighbor), state: 'visited' },
        ]);

        steps.push(
          createStep('visit', `Discovered ${neighbor}, adding to queue`, {
            graph,
            currentNode: current,
            queue: [...queue],
            visitedNodes: [...visited],
            message: `${neighbor} not visited. Queue: [${queue.join(', ')}]`,
          }, [8, 9, 10])
        );

        // Reset edge state
        if (edge) {
          graph = updateEdgeStates(graph, [
            { edgeIds: [edge.id], state: 'visited' },
          ]);
        }
      } else {
        steps.push(
          createStep('compare', `${neighbor} already visited, skipping`, {
            graph,
            currentNode: current,
            queue: [...queue],
            visitedNodes: [...visited],
            message: `${neighbor} already in visited set`,
          }, [8])
        );
      }
    }

    // Mark current as visited (not current anymore)
    graph = updateNodeStates(graph, [
      { nodeIds: [...visited], state: 'visited' },
    ]);
  }

  // BFS complete
  steps.push(
    createStep('complete', 'BFS traversal complete!', {
      graph,
      visitedNodes: [...visited],
      queue: [],
      message: `Visit order: ${visitOrder.join(' → ')}. Total nodes visited: ${visited.size}`,
    }, [11])
  );

  if (targetNode && !visited.has(targetNode)) {
    steps.push(
      createStep('not-found', `Target ${targetNode} is not reachable from ${startNode}`, {
        graph,
        visitedNodes: [...visited],
        message: `No path exists from ${startNode} to ${targetNode}`,
      })
    );
  }

  return steps;
}

// ===========================================
// Code Snippets
// ===========================================

export const bfsCode: AlgorithmCode = {
  javascript: {
    language: 'javascript',
    code: `function bfs(graph, start, target = null) {
  const visited = new Set();
  const queue = [start];
  const parent = new Map();
  
  visited.add(start);
  parent.set(start, null);
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Check if target found
    if (target && current === target) {
      return reconstructPath(parent, target);
    }
    
    // Process neighbors
    for (const neighbor of graph[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        parent.set(neighbor, current);
      }
    }
  }
  
  return target ? null : [...visited];
}`,
  },
  python: {
    language: 'python',
    code: `from collections import deque

def bfs(graph, start, target=None):
    visited = set()
    queue = deque([start])
    parent = {start: None}
    
    visited.add(start)
    
    while queue:
        current = queue.popleft()
        
        # Check if target found
        if target and current == target:
            return reconstruct_path(parent, target)
        
        # Process neighbors
        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                parent[neighbor] = current
    
    return None if target else list(visited)`,
  },
};
