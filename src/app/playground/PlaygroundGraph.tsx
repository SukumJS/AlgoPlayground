"use client";
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  DragEvent,
  useMemo,
} from "react";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Tutorial_modal from "../../components/shared/tutorial_modal";
import PostTest_portal from "@/src/components/shared/postTest_portal";
import TutorialGraph from "../../components/visualizer/tutorial_graph";
import TreeTrashBin from "../../components/visualizer/TreeTrashBin";
import { useGraphTutorial } from "@/src/hooks/useGraphTutorial";
import { useNodeInteraction } from "@/src/hooks/useNodeInteraction";
import {
  ReactFlow,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Controls,
  useReactFlow,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@xyflow/react/dist/base.css";
import Data_graph from "@/src/components/visualizer/data_graph";
import CustomNode from "@/src/components/shared/customNodeTreeandGraph";
import TreeEdge from "@/src/components/shared/treeEdge";
import FloatingEdge from "@/src/components/shared/FloatingEdge";
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";
import GoToHome_Portal from "@/src/components/shared/goToHome_Portal";

// ── Graph Algorithm imports ──────────────────────────────────────────
import { getAlgorithmRunner } from "@/src/components/visualizer/algorithmGraph";
import { useAlgorithmAnimation } from "@/src/hooks/graph/useAlgorithmAnimation";
import { useGraphController } from "@/src/hooks/useGraphController";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { tree: TreeEdge, floatingEdge: FloatingEdge };
const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = { animated: false };

const getDefaultGraphExplanation = (name: string) =>
  `This section will explain ${name}. Perform an operation to begin.`;

// สร้าง Object ไว้แปลงชื่อ Graph Algorithm
const algorithmNames: Record<string, string> = {
  dijkstra: "Dijkstra's Algorithm",
  "bellman-ford": "Bellman-Ford Algorithm",
  prims: "Prim's Algorithm",
  kruskals: "Kruskal's Algorithm",
  "breadth-first-search": "Breadth-First Search",
  "depth-first-search": "Depth-First Search",
};

// Initial nodes for graph (Dijkstra's algorithm layout from Figma - scaled for spacing)
const graphInitialNodes: Node[] = [
  {
    id: "g1",
    type: "custom",
    data: { label: "64", variant: "circle" },
    position: { x: 50, y: 280 },
  },
  {
    id: "g2",
    type: "custom",
    data: { label: "39", variant: "circle" },
    position: { x: 260, y: 120 },
  },
  {
    id: "g3",
    type: "custom",
    data: { label: "97", variant: "circle" },
    position: { x: 520, y: 130 },
  },
  {
    id: "g4",
    type: "custom",
    data: { label: "69", variant: "circle" },
    position: { x: 330, y: 380 },
  },
  {
    id: "g5",
    type: "custom",
    data: { label: "70", variant: "circle" },
    position: { x: 620, y: 320 },
  },
];

// Initial edges for graph (directed with weights) - 69→39 is created during tutorial
const graphDirectedInitialEdges: Edge[] = [
  {
    id: "eg-64-39",
    source: "g1",
    target: "g2",
    type: "floatingEdge",
    label: "4",
    data: { weight: 4 },
    style: { stroke: "#222121", strokeWidth: 1 },
    markerEnd: {
      type: "arrowclosed" as const,
      width: 25,
      height: 25,
      color: "#222121",
    },
  },
  {
    id: "eg-64-69",
    source: "g1",
    target: "g4",
    type: "floatingEdge",
    label: "1",
    data: { weight: 1 },
    style: { stroke: "#222121", strokeWidth: 1 },
    markerEnd: {
      type: "arrowclosed" as const,
      width: 25,
      height: 25,
      color: "#222121",
    },
  },
  {
    id: "eg-39-97",
    source: "g2",
    target: "g3",
    type: "floatingEdge",
    label: "3",
    data: { weight: 3 },
    style: { stroke: "#222121", strokeWidth: 1 },
    markerEnd: {
      type: "arrowclosed" as const,
      width: 25,
      height: 25,
      color: "#222121",
    },
  },
  {
    id: "eg-97-70",
    source: "g3",
    target: "g5",
    type: "floatingEdge",
    label: "1",
    data: { weight: 1 },
    style: { stroke: "#222121", strokeWidth: 1 },
    markerEnd: {
      type: "arrowclosed" as const,
      width: 25,
      height: 25,
      color: "#222121",
    },
  },
];

// Initial edges for graph (undirected, no weights) — used by BFS/DFS
const graphUndirectedInitialEdges: Edge[] = [
  {
    id: "eg-64-39",
    source: "g1",
    target: "g2",
    type: "floatingEdge",
    data: { directed: false },
    style: { stroke: "#222121", strokeWidth: 1 },
  },
  {
    id: "eg-64-69",
    source: "g1",
    target: "g4",
    type: "floatingEdge",
    data: { directed: false },
    style: { stroke: "#222121", strokeWidth: 1 },
  },
  {
    id: "eg-39-97",
    source: "g2",
    target: "g3",
    type: "floatingEdge",
    data: { directed: false },
    style: { stroke: "#222121", strokeWidth: 1 },
  },
  {
    id: "eg-97-70",
    source: "g3",
    target: "g5",
    type: "floatingEdge",
    data: { directed: false },
    style: { stroke: "#222121", strokeWidth: 1 },
  },
];

// Initial edges for graph (undirected WITH weights) — used by Prim's/Kruskal's
const graphUndirectedWeightedInitialEdges: Edge[] = [
  {
    id: "eg-64-39",
    source: "g1",
    target: "g2",
    type: "floatingEdge",
    label: "4",
    data: { directed: false, weight: 4 },
    style: { stroke: "#222121", strokeWidth: 1 },
  },
  {
    id: "eg-64-69",
    source: "g1",
    target: "g4",
    type: "floatingEdge",
    label: "1",
    data: { directed: false, weight: 1 },
    style: { stroke: "#222121", strokeWidth: 1 },
  },
  {
    id: "eg-39-97",
    source: "g2",
    target: "g3",
    type: "floatingEdge",
    label: "3",
    data: { directed: false, weight: 3 },
    style: { stroke: "#222121", strokeWidth: 1 },
  },
  {
    id: "eg-97-70",
    source: "g3",
    target: "g5",
    type: "floatingEdge",
    label: "1",
    data: { directed: false, weight: 1 },
    style: { stroke: "#222121", strokeWidth: 1 },
  },
];

export default function PlaygroundGraph({ algorithm }: { algorithm: string }) {
  // ── Determine graph mode ───────────────────────────────────────────────────
  // Directed: Dijkstra and Bellman-Ford use directed (weighted) edges
  const isDirectedGraph = ["dijkstra", "bellman-ford"].includes(algorithm);
  // Weighted: Dijkstra, Bellman-Ford, Prim's, Kruskal's use weighted edges
  const isWeightedGraph = [
    "dijkstra",
    "bellman-ford",
    "prims",
    "kruskals",
  ].includes(algorithm);

  // Choose correct initial edges based on algorithm type
  const initialEdges = useMemo(() => {
    if (isDirectedGraph) return graphDirectedInitialEdges;
    if (isWeightedGraph) return graphUndirectedWeightedInitialEdges;
    return graphUndirectedInitialEdges;
  }, [isDirectedGraph, isWeightedGraph]);

  // ── State Management ───────────────────────────────────────────────────────
  const [nodes, setNodes] = useState<Node[]>(graphInitialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showInfo, setShowInfo] = useState(false);
  const defaultPrettyName = algorithm
    ? algorithmNames[algorithm] || "Graph Algorithms"
    : "Graph Algorithms";
  const [explanation, setExplanation] = useState<string>(
    getDefaultGraphExplanation(defaultPrettyName),
  );

  // ดึงชื่อที่สวยงามจาก Mapping (ถ้าไม่เจอให้ใช้ค่า Default)
  const prettyName = algorithm
    ? algorithmNames[algorithm] || "Graph Algorithms"
    : "Graph Algorithms";

  // reset explanation when the selected algorithm changes
  React.useEffect(() => {
    if (algorithm) {
      setExplanation(getDefaultGraphExplanation(prettyName));
    }
  }, [algorithm, prettyName]);

  const { flowToScreenPosition } = useReactFlow();

  // ── Algorithm Animation Pipeline ────────────────────────────────────────────
  const runner = useMemo(() => getAlgorithmRunner(algorithm), [algorithm]);
  const animation = useAlgorithmAnimation(
    runner,
    nodes,
    edges,
    setNodes,
    setEdges,
  );
  const controller = useGraphController(animation);

  // True when the animation pipeline has generated steps (playing, paused, or finished)
  const isAnimationActive = animation.totalSteps > 0;

  // Keep a ref to animation so the search callback has a stable identity
  const animationRef = useRef(animation);
  useEffect(() => {
    animationRef.current = animation;
  }, [animation]);

  // Derive effective explanation based on animation state
  const effectiveExplanation = useMemo(() => {
    if (isAnimationActive && animation.description) {
      return animation.description;
    }
    if (explanation.trim()) {
      return explanation;
    }
    return getDefaultGraphExplanation(prettyName);
  }, [isAnimationActive, animation.description, explanation, prettyName]);

  // Callback from Data_graph "Search" button — stable identity via ref
  const handleAlgorithmSearch = useCallback(
    (startLabel: string, endLabel: string) => {
      animationRef.current.reset();
      animationRef.current.start(startLabel, endLabel);
    },
    [],
  );

  // ── Random Graph Generation ────────────────────────────────────────────────
  const handleRandomGraphGenerate = useCallback(
    (count: number) => {
      if (count <= 0) return;

      const currentNodes = nodes;
      let allNodes: Node[];

      // Circular layout helper: distribute nodes evenly around a center
      const centerX = 350;
      const centerY = 280;
      const baseRadius = Math.max(120, count * 30); // scale radius with node count

      const circularPosition = (index: number, total: number) => ({
        x: Math.round(
          centerX +
            baseRadius * Math.cos((2 * Math.PI * index) / total - Math.PI / 2),
        ),
        y: Math.round(
          centerY +
            baseRadius * Math.sin((2 * Math.PI * index) / total - Math.PI / 2),
        ),
      });

      if (count > currentNodes.length) {
        // Keep existing nodes, add more to reach the target count
        const existingLabels = new Set(
          currentNodes.map((n) => String(n.data.label)),
        );
        const toAdd = count - currentNodes.length;
        const addedNodes: Node[] = [];

        // Place new nodes in remaining slots around the circle
        for (let i = 0; i < toAdd; i++) {
          let label: number;
          let tries = 0;
          do {
            label = Math.floor(Math.random() * 99) + 1;
            tries++;
          } while (existingLabels.has(String(label)) && tries < 200);
          existingLabels.add(String(label));

          addedNodes.push({
            id: `g_rand_${Date.now()}_${i}`,
            type: "custom",
            data: { label: String(label), variant: "circle" },
            position: circularPosition(currentNodes.length + i, count),
          });
        }

        allNodes = [...currentNodes, ...addedNodes];
      } else {
        // Generate fresh nodes in circular layout
        const usedLabels = new Set<string>();
        const newNodes: Node[] = [];

        for (let i = 0; i < count; i++) {
          let label: number;
          let tries = 0;
          do {
            label = Math.floor(Math.random() * 99) + 1;
            tries++;
          } while (usedLabels.has(String(label)) && tries < 200);
          usedLabels.add(String(label));

          newNodes.push({
            id: `g_rand_${Date.now()}_${i}`,
            type: "custom",
            data: { label: String(label), variant: "circle" },
            position: circularPosition(i, count),
          });
        }

        allNodes = newNodes;
      }

      // Generate random edges between nodes (~30% chance per pair for connectivity)
      const randomEdges: Edge[] = [];
      const edgeSet = new Set<string>();

      for (let i = 0; i < allNodes.length; i++) {
        for (let j = i + 1; j < allNodes.length; j++) {
          if (Math.random() < 0.3) {
            const src = allNodes[i];
            const tgt = allNodes[j];
            const edgeKey = `${src.id}-${tgt.id}`;
            if (edgeSet.has(edgeKey)) continue;
            edgeSet.add(edgeKey);

            const weight = isWeightedGraph
              ? Math.floor(Math.random() * 10) + 1
              : undefined;

            const edge: Edge = {
              id: `e-${src.data.label}-${tgt.data.label}-${Date.now()}-${randomEdges.length}`,
              source: src.id,
              target: tgt.id,
              type: "floatingEdge",
              ...(isWeightedGraph && {
                label: String(weight),
                data: {
                  weight,
                  ...(isDirectedGraph ? {} : { directed: false }),
                },
              }),
              ...(!isWeightedGraph && {
                data: { directed: false },
              }),
              style: { stroke: "#222121", strokeWidth: 1 },
              ...(isDirectedGraph && {
                markerEnd: {
                  type: "arrowclosed" as const,
                  width: 25,
                  height: 25,
                  color: "#222121",
                },
              }),
            };

            randomEdges.push(edge);
          }
        }
      }

      // Ensure graph is connected: for each disconnected node, add one random edge
      const connected = new Set<string>();
      if (allNodes.length > 0) {
        connected.add(allNodes[0].id);
        const edgeMap = new Map<string, Set<string>>();
        for (const e of randomEdges) {
          if (!edgeMap.has(e.source)) edgeMap.set(e.source, new Set());
          if (!edgeMap.has(e.target)) edgeMap.set(e.target, new Set());
          edgeMap.get(e.source)!.add(e.target);
          edgeMap.get(e.target)!.add(e.source);
        }
        // BFS to find connected component
        const queue = [allNodes[0].id];
        while (queue.length > 0) {
          const curr = queue.shift()!;
          for (const neighbor of edgeMap.get(curr) ?? []) {
            if (!connected.has(neighbor)) {
              connected.add(neighbor);
              queue.push(neighbor);
            }
          }
        }
        // Connect disconnected nodes
        for (const node of allNodes) {
          if (!connected.has(node.id)) {
            // Pick a random connected node to link to
            const connectedArr = Array.from(connected);
            const targetId =
              connectedArr[Math.floor(Math.random() * connectedArr.length)];
            const targetNode = allNodes.find((n) => n.id === targetId)!;
            const weight = isWeightedGraph
              ? Math.floor(Math.random() * 10) + 1
              : undefined;

            const edge: Edge = {
              id: `e-${node.data.label}-${targetNode.data.label}-${Date.now()}-conn`,
              source: node.id,
              target: targetId,
              type: "floatingEdge",
              ...(isWeightedGraph && {
                label: String(weight),
                data: {
                  weight,
                  ...(isDirectedGraph ? {} : { directed: false }),
                },
              }),
              ...(!isWeightedGraph && {
                data: { directed: false },
              }),
              style: { stroke: "#222121", strokeWidth: 1 },
              ...(isDirectedGraph && {
                markerEnd: {
                  type: "arrowclosed" as const,
                  width: 25,
                  height: 25,
                  color: "#222121",
                },
              }),
            };

            randomEdges.push(edge);
            connected.add(node.id);
          }
        }
      }

      setNodes(allNodes);
      setEdges(randomEdges);
    },
    [nodes, setNodes, setEdges, isDirectedGraph, isWeightedGraph],
  );

  // Reset graph: clear all nodes and edges
  const handleResetGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  // ── Custom Hooks ───────────────────────────────────────────────────────────
  // Graph Tutorial hook
  const graphTutorial = useGraphTutorial({
    nodes,
    edges,
    flowToScreenPosition,
    setNodes,
    setEdges,
    isGraph: true,
    directed: isDirectedGraph,
    weighted: isWeightedGraph,
  });

  // Node interaction (universal - works for graph interactions, active when NOT in tutorial)
  const nodeInteraction = useNodeInteraction({
    nodes,
    edges,
    setNodes,
    setEdges,
    isTree: false,
    isGraph: true,
    isTutorialActive: graphTutorial.showTutorial,
    directed: isDirectedGraph,
    weighted: isWeightedGraph,
  });

  // ── React Flow Event Handlers ──────────────────────────────────────────────
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (isAnimationActive) return; // lock during animation
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [isAnimationActive],
  );

  // ── Custom Interaction Handlers ────────────────────────────────────────────
  // Edge click handler (for weight editing)
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (isAnimationActive) return; // lock during animation
      if (graphTutorial.showTutorial) {
        graphTutorial.handleWeightClick(edge.id);
      } else {
        nodeInteraction.handleEdgeClick(event, edge.id);
      }
    },
    [isAnimationActive, graphTutorial, nodeInteraction],
  );

  // Combined node click handler
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (isAnimationActive) return; // lock during animation
      if (graphTutorial.showTutorial) {
        graphTutorial.handleNodeClick(event, node);
      } else {
        nodeInteraction.handleNodeClick(event, node);
      }
    },
    [isAnimationActive, graphTutorial, nodeInteraction],
  );

  // Combined node drag handlers
  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (isAnimationActive) return; // lock during animation
      if (graphTutorial.showTutorial) return;
      nodeInteraction.handleNodeDragStart(event, node);
    },
    [isAnimationActive, graphTutorial.showTutorial, nodeInteraction],
  );

  const handleNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (graphTutorial.showTutorial) {
        graphTutorial.onNodeDrag(event, node);
      } else {
        nodeInteraction.handleNodeDrag(event, node);
      }
    },
    [graphTutorial, nodeInteraction],
  );

  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (graphTutorial.showTutorial) {
        graphTutorial.onNodeDragStop(event, node);
      } else {
        nodeInteraction.handleNodeDragStop(event, node);
      }
    },
    [graphTutorial, nodeInteraction],
  );

  // Pane click to clear selection (universal)
  const handlePaneClick = useCallback(() => {
    if (!graphTutorial.showTutorial) {
      nodeInteraction.handlePaneClick();
    }
  }, [graphTutorial.showTutorial, nodeInteraction]);

  const sideTabTitle = runner?.name ?? "Graph Algorithms";

  const sideTabMemo = useMemo(
    () => (
      <SideTab title={sideTabTitle}>
        <div>
          <CodeAlgo tutorialMode={graphTutorial.showTutorial} />
          <ExplainAlgo explanation={effectiveExplanation} />
          <Data_graph
            onSearch={handleAlgorithmSearch}
            algorithm={algorithm}
            tutorialMode={graphTutorial.showTutorial}
            setExplanation={setExplanation}
            isAnimating={isAnimationActive}
            onRandomGenerate={handleRandomGraphGenerate}
            onResetGraph={handleResetGraph}
          />
        </div>
        <div>
          <PostTest_portal algorithm={algorithm} algoType="graph" />
        </div>
      </SideTab>
    ),
    [
      graphTutorial.showTutorial,
      algorithm,
      handleAlgorithmSearch,
      handleRandomGraphGenerate,
      handleResetGraph,
      sideTabTitle,
      effectiveExplanation,
      setExplanation,
      isAnimationActive,
    ],
  );

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={
          isAnimationActive
            ? undefined
            : graphTutorial.showTutorial
              ? graphTutorial.tutorialStep === graphTutorial.dragDeleteStep
                ? onNodesChange
                : undefined
              : onNodesChange
        }
        onEdgesChange={
          graphTutorial.showTutorial || isAnimationActive
            ? undefined
            : onEdgesChange
        }
        onConnect={isAnimationActive ? undefined : onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onDragOver={onDragOver}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDragStart={handleNodeDragStart}
        onPaneClick={handlePaneClick}
        panOnDrag={!graphTutorial.showTutorial}
        zoomOnScroll={!graphTutorial.showTutorial}
        zoomOnPinch={!graphTutorial.showTutorial}
        zoomOnDoubleClick={!graphTutorial.showTutorial}
        nodesDraggable={
          !isAnimationActive &&
          (!graphTutorial.showTutorial ||
            (graphTutorial.showTutorial &&
              graphTutorial.tutorialStep === graphTutorial.dragDeleteStep))
        }
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        {!graphTutorial.showTutorial && <Controls />}
      </ReactFlow>

      <div className="absolute bottom-4 w-full z-10">
        <ControlPanel controller={controller} />
      </div>

      {sideTabMemo}

      {/* Top Left Component show Info for reading how algo work & Status of Node in Playground Page */}
      <div className="absolute top-4 left-8 z-10 flex gap-2">
        <GoToHome_Portal />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowInfo(true);
          }}
          className="rounded-full bg-white p-2 border border-gray-200 shadow-lg hover:shadow-lg hover:bg-gray-100 transition cursor-pointer"
        >
          <Info color="#000000" />
        </button>
        <StatusNode />
      </div>

      {/* Info Reading inside Playground */}
      <Reading_modal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      {/* Tutorial overlay for graph — only render after positions are stable */}
      {graphTutorial.showTutorial && graphTutorial.positionsReady && (
        <TutorialGraph
          onComplete={graphTutorial.handleTutorialComplete}
          currentStep={graphTutorial.tutorialStep}
          setCurrentStep={graphTutorial.setTutorialStep}
          directed={graphTutorial.directed}
          weighted={graphTutorial.weighted}
          node69ScreenPos={graphTutorial.node69ScreenPos}
          node70ScreenPos={graphTutorial.node70ScreenPos}
          edge64to39WeightPos={graphTutorial.edge64to39WeightPos}
          trashBinPos={graphTutorial.trashBinPos}
          isTrashActive={graphTutorial.isTrashActive}
          nodeScreenRadius={graphTutorial.nodeScreenRadius}
          showWeightInput={graphTutorial.showWeightInput}
          weightInputValue={graphTutorial.weightInputValue}
          onWeightInputChange={graphTutorial.handleWeightInputChange}
          onWeightConfirm={graphTutorial.handleWeightConfirm}
        />
      )}

      {/* Universal trash bin (non-tutorial mode) */}
      {!graphTutorial.showTutorial && (
        <TreeTrashBin
          show={nodeInteraction.showTrashBin}
          isActive={nodeInteraction.isTrashActive}
          position={nodeInteraction.trashBinPos}
        />
      )}

      {/* Edge Weight Edit Modal (non-tutorial mode, graph) */}
      {nodeInteraction.showWeightModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 min-w-70">
            <p className="text-lg text-gray-800 font-medium mb-4 text-center">
              Enter edge weight
            </p>
            <input
              type="number"
              value={nodeInteraction.weightInputValue}
              onChange={(e) =>
                nodeInteraction.handleWeightInputChange(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") nodeInteraction.handleWeightConfirm();
                if (e.key === "Escape")
                  nodeInteraction.handleWeightModalClose();
              }}
              className="w-full text-center text-3xl font-bold p-4 border-2 border-gray-300 rounded-xl focus:border-[#D9E363] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={nodeInteraction.handleWeightModalClose}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={nodeInteraction.handleWeightConfirm}
                className="flex-1 bg-[#222121] text-white py-3 rounded-xl font-semibold hover:bg-[#333] transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion modal for graph tutorial */}
      {graphTutorial.showCompletionModal && (
        <Tutorial_modal
          showModal={graphTutorial.showCompletionModal}
          onClose={() => graphTutorial.setShowCompletionModal(false)}
          tutorialContent={[
            {
              title: "Tutorial Complete!",
              description: "You are now ready to explore Graph Algorithms.",
            },
          ]}
        />
      )}
    </div>
  );
}
