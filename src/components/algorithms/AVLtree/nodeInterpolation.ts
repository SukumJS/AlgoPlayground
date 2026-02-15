import type { Node as RFNode } from '@xyflow/react';
import type { XYPosition } from '@xyflow/react';

/**
 * Interpolate node positions between two position maps
 * Used for smooth animations between tree states
 */
export function interpolateNodes(
  templateNodes: RFNode[],
  startMap: Map<string, XYPosition>,
  endMap: Map<string, XYPosition>,
  fraction: number
): RFNode[] {
  return templateNodes.map(node => {
    const start = startMap.get(node.id) || endMap.get(node.id) || { x: 0, y: 0 };
    const end = endMap.get(node.id) || startMap.get(node.id) || { x: start.x, y: start.y };
    
    const interpolatedX = start.x + (end.x - start.x) * fraction;
    const interpolatedY = start.y + (end.y - start.y) * fraction;
    
    return {
      ...node,
      position: { x: interpolatedX, y: interpolatedY }
    } as RFNode;
  });
}

/**
 * Merge two node arrays, preserving all unique nodes
 * Uses endNode data when available for each node id
 */
export function mergeNodeArrays(startNodes: RFNode[], endNodes: RFNode[]): RFNode[] {
  const nodeMap = new Map<string, RFNode>();
  
  // Add start nodes
  startNodes.forEach(node => nodeMap.set(node.id, node));
  
  // Overlay end nodes (overwrite with end node data)
  endNodes.forEach(node => {
    const existing = nodeMap.get(node.id);
    nodeMap.set(node.id, {
      ...(existing || node),
      ...node
    });
  });
  
  return Array.from(nodeMap.values());
}

/**
 * Merge two edge arrays
 * Keys edges by their target (child) node
 */
export function mergeEdgeArrays(startEdges: any[], endEdges: any[]): any[] {
  const edgeMap = new Map<string, any>();

  const addEdge = (edge: any) => {
    if (!edge || !edge.target) return;
    
    // Use target as key so edge follows the child node
    const key = `${edge.target}`;
    
    const canonicalEdge = {
      id: `edge-${edge.source ?? 'unknown'}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'straight',
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      style: edge.style,
      markerEnd: edge.markerEnd,
      data: edge.data,
    };
    
    edgeMap.set(key, {
      ...(edgeMap.get(key) || {}),
      ...canonicalEdge
    });
  };

  (startEdges || []).forEach(edge => addEdge(edge));
  (endEdges || []).forEach(edge => addEdge(edge));

  return Array.from(edgeMap.values());
}

/**
 * Build a position map from ReactFlow nodes
 */
export function buildPositionMap(nodes: RFNode[]): Map<string, XYPosition> {
  const posMap = new Map<string, XYPosition>();
  nodes.forEach(node => {
    posMap.set(node.id, node.position);
  });
  return posMap;
}

/**
 * Filter edges to only include those connecting existing nodes
 */
export function filterValidEdges(edges: any[], nodeIds: Set<string>): any[] {
  return edges.filter(edge => 
    nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );
}
