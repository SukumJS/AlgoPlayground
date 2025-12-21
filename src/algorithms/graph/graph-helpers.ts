import { Graph, GraphNode, GraphEdge, ElementState } from '@/types';
import { generateId } from '@/lib/utils';

// ===========================================
// Graph Creation Helpers
// ===========================================

export interface GraphInput {
  nodes: { id: string; label: string }[];
  edges: { source: string; target: string; weight?: number }[];
  directed?: boolean;
  weighted?: boolean;
}

export function createGraph(input: GraphInput): Graph {
  const { nodes, edges, directed = false, weighted = false } = input;

  // Calculate positions in a circular layout
  const nodeCount = nodes.length;
  const centerX = 300;
  const centerY = 200;
  const radius = Math.min(150, 50 + nodeCount * 20);

  const graphNodes: GraphNode[] = nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / nodeCount - Math.PI / 2;
    return {
      id: node.id,
      label: node.label,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      state: 'default',
    };
  });

  const graphEdges: GraphEdge[] = edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.source,
    target: edge.target,
    weight: weighted ? edge.weight : undefined,
    state: 'default',
    directed,
  }));

  return {
    nodes: graphNodes,
    edges: graphEdges,
    directed,
    weighted,
  };
}

// ===========================================
// Graph State Update Helpers
// ===========================================

export function updateNodeStates(
  graph: Graph,
  updates: { nodeIds: string[]; state: ElementState }[]
): Graph {
  const newNodes = graph.nodes.map((node) => {
    let newState: ElementState = 'default';
    
    for (const { nodeIds, state } of updates) {
      if (nodeIds.includes(node.id)) {
        newState = state;
        break;
      }
    }
    
    return { ...node, state: newState };
  });

  return { ...graph, nodes: newNodes };
}

export function updateEdgeStates(
  graph: Graph,
  updates: { edgeIds: string[]; state: ElementState }[]
): Graph {
  const newEdges = graph.edges.map((edge) => {
    let newState: ElementState = 'default';
    
    for (const { edgeIds, state } of updates) {
      if (edgeIds.includes(edge.id)) {
        newState = state;
        break;
      }
    }
    
    return { ...edge, state: newState };
  });

  return { ...graph, edges: newEdges };
}

export function setNodeState(graph: Graph, nodeId: string, state: ElementState): Graph {
  return {
    ...graph,
    nodes: graph.nodes.map((node) =>
      node.id === nodeId ? { ...node, state } : node
    ),
  };
}

export function setEdgeState(graph: Graph, edgeId: string, state: ElementState): Graph {
  return {
    ...graph,
    edges: graph.edges.map((edge) =>
      edge.id === edgeId ? { ...edge, state } : edge
    ),
  };
}

// ===========================================
// Graph Traversal Helpers
// ===========================================

export function getNeighbors(graph: Graph, nodeId: string): string[] {
  const neighbors: string[] = [];
  
  for (const edge of graph.edges) {
    if (edge.source === nodeId) {
      neighbors.push(edge.target);
    }
    // For undirected graphs, check both directions
    if (!graph.directed && edge.target === nodeId) {
      neighbors.push(edge.source);
    }
  }
  
  return neighbors;
}

export function getEdgeBetween(graph: Graph, source: string, target: string): GraphEdge | undefined {
  return graph.edges.find(
    (edge) =>
      (edge.source === source && edge.target === target) ||
      (!graph.directed && edge.source === target && edge.target === source)
  );
}

export function getNodeById(graph: Graph, nodeId: string): GraphNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

// ===========================================
// Adjacency List Builder
// ===========================================

export function buildAdjacencyList(graph: Graph): Map<string, { neighbor: string; weight: number; edgeId: string }[]> {
  const adjacencyList = new Map<string, { neighbor: string; weight: number; edgeId: string }[]>();
  
  // Initialize all nodes
  for (const node of graph.nodes) {
    adjacencyList.set(node.id, []);
  }
  
  // Add edges
  for (const edge of graph.edges) {
    const weight = edge.weight ?? 1;
    
    adjacencyList.get(edge.source)?.push({
      neighbor: edge.target,
      weight,
      edgeId: edge.id,
    });
    
    // For undirected graphs, add reverse edge
    if (!graph.directed) {
      adjacencyList.get(edge.target)?.push({
        neighbor: edge.source,
        weight,
        edgeId: edge.id,
      });
    }
  }
  
  return adjacencyList;
}

// ===========================================
// Sample Graphs for Testing
// ===========================================

export const sampleGraphs = {
  simple: {
    nodes: [
      { id: 'A', label: 'A' },
      { id: 'B', label: 'B' },
      { id: 'C', label: 'C' },
      { id: 'D', label: 'D' },
      { id: 'E', label: 'E' },
    ],
    edges: [
      { source: 'A', target: 'B' },
      { source: 'A', target: 'C' },
      { source: 'B', target: 'D' },
      { source: 'C', target: 'D' },
      { source: 'D', target: 'E' },
    ],
    directed: false,
    weighted: false,
  },
  
  weighted: {
    nodes: [
      { id: 'A', label: 'A' },
      { id: 'B', label: 'B' },
      { id: 'C', label: 'C' },
      { id: 'D', label: 'D' },
      { id: 'E', label: 'E' },
    ],
    edges: [
      { source: 'A', target: 'B', weight: 4 },
      { source: 'A', target: 'C', weight: 2 },
      { source: 'B', target: 'C', weight: 1 },
      { source: 'B', target: 'D', weight: 5 },
      { source: 'C', target: 'D', weight: 8 },
      { source: 'C', target: 'E', weight: 10 },
      { source: 'D', target: 'E', weight: 2 },
    ],
    directed: false,
    weighted: true,
  },
  
  directed: {
    nodes: [
      { id: '1', label: '1' },
      { id: '2', label: '2' },
      { id: '3', label: '3' },
      { id: '4', label: '4' },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
    ],
    directed: true,
    weighted: false,
  },
};
