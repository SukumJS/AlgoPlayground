'use client';

import { useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeProps,
  EdgeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Graph, GraphNode, GraphEdge, ElementState } from '@/types';
import { cn } from '@/lib/utils';

// ===========================================
// Types
// ===========================================

interface GraphVisualizerProps {
  graph: Graph;
  currentNode?: string;
  visitedNodes?: string[];
  pathNodes?: string[];
  pathEdges?: string[];
  showWeights?: boolean;
  className?: string;
}

// ===========================================
// Color mapping
// ===========================================

const nodeStateColors: Record<ElementState, { bg: string; border: string; text: string }> = {
  default: { bg: '#f1f5f9', border: '#94a3b8', text: '#334155' },
  current: { bg: '#3b82f6', border: '#1d4ed8', text: '#ffffff' },
  visited: { bg: '#a855f7', border: '#7c3aed', text: '#ffffff' },
  path: { bg: '#14b8a6', border: '#0d9488', text: '#ffffff' },
  comparing: { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
  highlight: { bg: '#eab308', border: '#ca8a04', text: '#1f2937' },
  found: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },
  'not-found': { bg: '#9ca3af', border: '#6b7280', text: '#ffffff' },
  swapping: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
  sorted: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },
  pivot: { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' },
  minimum: { bg: '#ec4899', border: '#db2777', text: '#ffffff' },
};

const edgeStateColors: Record<ElementState, string> = {
  default: '#94a3b8',
  current: '#3b82f6',
  visited: '#a855f7',
  path: '#14b8a6',
  comparing: '#f59e0b',
  highlight: '#eab308',
  found: '#22c55e',
  'not-found': '#9ca3af',
  swapping: '#ef4444',
  sorted: '#22c55e',
  pivot: '#6366f1',
  minimum: '#ec4899',
};

// ===========================================
// Custom Node Component
// ===========================================

function CustomNode({ data }: NodeProps) {
  const colors = nodeStateColors[data.state as ElementState] || nodeStateColors.default;
  const isCurrent = data.state === 'current';
  const isPath = data.state === 'path';

  return (
    <motion.div
      className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm',
        'border-2 shadow-md transition-all duration-200',
        isCurrent && 'ring-4 ring-blue-200',
        isPath && 'ring-4 ring-teal-200'
      )}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
      animate={{
        scale: isCurrent ? 1.2 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <span>{data.label}</span>
      {data.distance !== undefined && data.distance !== Infinity && (
        <span className="absolute -bottom-5 text-xs text-gray-600 font-normal">
          d={data.distance}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </motion.div>
  );
}

// ===========================================
// Node Types
// ===========================================

const nodeTypes = {
  custom: CustomNode,
};

// ===========================================
// Graph Visualizer Component
// ===========================================

export function GraphVisualizer({
  graph,
  currentNode,
  visitedNodes = [],
  pathNodes = [],
  pathEdges = [],
  showWeights = true,
  className,
}: GraphVisualizerProps) {
  // Convert graph nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return graph.nodes.map((node) => {
      let state: ElementState = node.state;
      
      // Override state based on props
      if (pathNodes.includes(node.id)) {
        state = 'path';
      } else if (node.id === currentNode) {
        state = 'current';
      } else if (visitedNodes.includes(node.id)) {
        state = 'visited';
      }

      return {
        id: node.id,
        type: 'custom',
        position: { x: node.x, y: node.y },
        data: {
          label: node.label,
          state,
          distance: node.distance,
        },
        draggable: true,
      };
    });
  }, [graph.nodes, currentNode, visitedNodes, pathNodes]);

  // Convert graph edges to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return graph.edges.map((edge) => {
      let state: ElementState = edge.state;
      
      // Override state for path edges
      if (pathEdges.includes(edge.id)) {
        state = 'path';
      }

      const color = edgeStateColors[state] || edgeStateColors.default;
      const isHighlighted = state !== 'default';

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'default',
        animated: isHighlighted,
        style: {
          stroke: color,
          strokeWidth: isHighlighted ? 3 : 2,
        },
        markerEnd: graph.directed
          ? {
              type: MarkerType.ArrowClosed,
              color,
            }
          : undefined,
        label: showWeights && edge.weight !== undefined ? String(edge.weight) : undefined,
        labelStyle: {
          fill: '#374151',
          fontWeight: 500,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.8,
        },
      };
    });
  }, [graph.edges, graph.directed, pathEdges, showWeights]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when graph changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (graph.nodes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64 text-gray-400', className)}>
        No graph data to display
      </div>
    );
  }

  return (
    <div className={cn('h-[400px] w-full bg-gray-50 rounded-xl border border-gray-200', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.5}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls className="bg-white rounded-lg shadow-md" />
        <MiniMap
          className="bg-white rounded-lg shadow-md"
          nodeColor={(node) => {
            const state = node.data?.state as ElementState;
            return nodeStateColors[state]?.bg || nodeStateColors.default.bg;
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm text-xs">
        <LegendItem color="#f1f5f9" borderColor="#94a3b8" label="Default" />
        <LegendItem color="#3b82f6" borderColor="#1d4ed8" label="Current" />
        <LegendItem color="#a855f7" borderColor="#7c3aed" label="Visited" />
        <LegendItem color="#14b8a6" borderColor="#0d9488" label="Path" />
      </div>
    </div>
  );
}

// ===========================================
// Legend Item
// ===========================================

function LegendItem({ 
  color, 
  borderColor, 
  label 
}: { 
  color: string; 
  borderColor: string; 
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div 
        className="w-3 h-3 rounded-full border-2"
        style={{ backgroundColor: color, borderColor }}
      />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

// ===========================================
// Simple Graph View (without React Flow)
// ===========================================

interface SimpleGraphProps {
  graph: Graph;
  currentNode?: string;
  visitedNodes?: string[];
  className?: string;
}

export function SimpleGraphVisualizer({
  graph,
  currentNode,
  visitedNodes = [],
  className,
}: SimpleGraphProps) {
  // Simple SVG-based visualization for smaller graphs
  const width = 600;
  const height = 400;

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height} className="bg-gray-50 rounded-xl">
        {/* Edges */}
        {graph.edges.map((edge) => {
          const sourceNode = graph.nodes.find((n) => n.id === edge.source);
          const targetNode = graph.nodes.find((n) => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;

          const isActive = edge.state !== 'default';
          const color = edgeStateColors[edge.state] || edgeStateColors.default;

          return (
            <g key={edge.id}>
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={color}
                strokeWidth={isActive ? 3 : 2}
                className="transition-all duration-300"
              />
              {edge.weight !== undefined && (
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - 8}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 font-medium"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          let state = node.state;
          if (node.id === currentNode) state = 'current';
          else if (visitedNodes.includes(node.id)) state = 'visited';

          const colors = nodeStateColors[state] || nodeStateColors.default;

          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={20}
                fill={colors.bg}
                stroke={colors.border}
                strokeWidth={2}
                className="transition-all duration-300"
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.text}
                className="text-sm font-semibold"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
