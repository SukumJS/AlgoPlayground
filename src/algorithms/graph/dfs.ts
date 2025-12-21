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
} from './graph-helpers';

// ===========================================
// DFS Input Type
// ===========================================

export interface DFSInput {
  graph: GraphInput;
  startNode: string;
  targetNode?: string;
  iterative?: boolean; // Use iterative (stack) or recursive
}

// ===========================================
// DFS Step Generator (Iterative)
// ===========================================

export function generateDFSSteps(input: DFSInput): AlgorithmStep[] {
  resetStepCounter();
  const steps: AlgorithmStep[] = [];
  let graph = createGraph(input.graph);
  const { startNode, targetNode, iterative = true } = input;
  
  const visited = new Set<string>();
  const stack: string[] = [];
  const visitOrder: string[] = [];
  const parents = new Map<string, string | null>();
  
  // Initial state
  steps.push(
    createStep('initialize', `Starting DFS from node ${startNode}`, {
      graph,
      currentNode: startNode,
      stack: [],
      visitedNodes: [],
      message: targetNode 
        ? `Finding path from ${startNode} to ${targetNode}` 
        : `Traversing all reachable nodes from ${startNode}`,
    }, [1])
  );

  // Push start node to stack
  stack.push(startNode);
  parents.set(startNode, null);

  graph = updateNodeStates(graph, [
    { nodeIds: [startNode], state: 'current' },
  ]);

  steps.push(
    createStep('visit', `Push starting node ${startNode} to stack`, {
      graph,
      currentNode: startNode,
      stack: [...stack],
      visitedNodes: [...visited],
      message: `Stack: [${stack.join(', ')}]`,
    }, [2])
  );

  // DFS loop
  while (stack.length > 0) {
    const current = stack.pop()!;

    // Skip if already visited (can happen with cycles in undirected graphs)
    if (visited.has(current)) {
      steps.push(
        createStep('compare', `Node ${current} already visited, skip`, {
          graph,
          currentNode: current,
          stack: [...stack],
          visitedNodes: [...visited],
          message: `${current} was already processed`,
        }, [3])
      );
      continue;
    }

    // Mark as visited
    visited.add(current);
    visitOrder.push(current);

    // Update visualization
    graph = updateNodeStates(graph, [
      { nodeIds: [current], state: 'current' },
      { nodeIds: [...visited].filter(n => n !== current), state: 'visited' },
    ]);

    steps.push(
      createStep('visit', `Pop and visit node ${current}`, {
        graph,
        currentNode: current,
        stack: [...stack],
        visitedNodes: [...visited],
        message: `Visiting ${current}. Stack: [${stack.join(', ') || 'empty'}]`,
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
          stack: [...stack],
          visitedNodes: [...visited],
          message: `Path found: ${path.join(' → ')}`,
        }, [6])
      );

      return steps;
    }

    // Get neighbors (reverse to maintain left-to-right order when popping)
    const neighbors = getNeighbors(graph, current).reverse();

    steps.push(
      createStep('initialize', `Exploring neighbors of ${current}: [${neighbors.reverse().join(', ')}]`, {
        graph,
        currentNode: current,
        stack: [...stack],
        visitedNodes: [...visited],
        message: `Node ${current} has ${neighbors.length} neighbor(s)`,
      }, [7])
    );

    // Reverse back for processing
    neighbors.reverse();

    // Add unvisited neighbors to stack
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
        
        // Only set parent if not already set (first path found)
        if (!parents.has(neighbor)) {
          parents.set(neighbor, current);
        }

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
          { nodeIds: [...visited].filter(n => n !== current), state: 'visited' },
        ]);

        steps.push(
          createStep('visit', `Push ${neighbor} to stack`, {
            graph,
            currentNode: current,
            stack: [...stack],
            visitedNodes: [...visited],
            message: `${neighbor} not visited. Stack: [${stack.join(', ')}]`,
          }, [8, 9])
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
            stack: [...stack],
            visitedNodes: [...visited],
            message: `${neighbor} already in visited set`,
          }, [8])
        );
      }
    }

    // Update to show current as visited
    graph = updateNodeStates(graph, [
      { nodeIds: [...visited], state: 'visited' },
    ]);
  }

  // DFS complete
  steps.push(
    createStep('complete', 'DFS traversal complete!', {
      graph,
      visitedNodes: [...visited],
      stack: [],
      message: `Visit order: ${visitOrder.join(' → ')}. Total nodes visited: ${visited.size}`,
    }, [10])
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

export const dfsCode: AlgorithmCode = {
  javascript: {
    language: 'javascript',
    code: `// Iterative DFS using stack
function dfs(graph, start, target = null) {
  const visited = new Set();
  const stack = [start];
  const parent = new Map();
  
  parent.set(start, null);
  
  while (stack.length > 0) {
    const current = stack.pop();
    
    if (visited.has(current)) continue;
    visited.add(current);
    
    // Check if target found
    if (target && current === target) {
      return reconstructPath(parent, target);
    }
    
    // Process neighbors (reverse for left-to-right order)
    for (const neighbor of graph[current].reverse()) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
        if (!parent.has(neighbor)) {
          parent.set(neighbor, current);
        }
      }
    }
  }
  
  return target ? null : [...visited];
}

// Recursive DFS
function dfsRecursive(graph, node, visited = new Set()) {
  visited.add(node);
  console.log(node); // Process node
  
  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      dfsRecursive(graph, neighbor, visited);
    }
  }
  
  return visited;
}`,
  },
  python: {
    language: 'python',
    code: `# Iterative DFS using stack
def dfs(graph, start, target=None):
    visited = set()
    stack = [start]
    parent = {start: None}
    
    while stack:
        current = stack.pop()
        
        if current in visited:
            continue
        visited.add(current)
        
        # Check if target found
        if target and current == target:
            return reconstruct_path(parent, target)
        
        # Process neighbors
        for neighbor in reversed(graph[current]):
            if neighbor not in visited:
                stack.append(neighbor)
                if neighbor not in parent:
                    parent[neighbor] = current
    
    return None if target else list(visited)

# Recursive DFS
def dfs_recursive(graph, node, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(node)
    print(node)  # Process node
    
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)
    
    return visited`,
  },
};
