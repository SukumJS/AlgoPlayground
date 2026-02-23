"use client";
import React, { useState, useCallback, DragEvent } from "react";
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
import '@xyflow/react/dist/base.css';
import Data_graph from "@/src/components/visualizer/data_graph";
import CustomNode from "@/src/components/shared/customNode";
import TreeEdge from "@/src/components/shared/treeEdge";
import FloatingEdge from "@/src/components/shared/FloatingEdge";
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";
import GoToHome_Portal from "@/src/components/shared/goToHome_Portal";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { tree: TreeEdge, floatingEdge: FloatingEdge };
const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = { animated: false };

// Initial nodes for graph (Dijkstra's algorithm layout from Figma - scaled for spacing)
const graphInitialNodes: Node[] = [
    { id: "g1", type: "custom", data: { label: "64", variant: "circle" }, position: { x: 50, y: 280 } },
    { id: "g2", type: "custom", data: { label: "39", variant: "circle" }, position: { x: 260, y: 120 } },
    { id: "g3", type: "custom", data: { label: "97", variant: "circle" }, position: { x: 520, y: 130 } },
    { id: "g4", type: "custom", data: { label: "69", variant: "circle" }, position: { x: 330, y: 380 } },
    { id: "g5", type: "custom", data: { label: "70", variant: "circle" }, position: { x: 620, y: 320 } },
];

// Initial edges for graph (directed with weights) - 69→39 is created during tutorial
const graphInitialEdges: Edge[] = [
    { id: "eg-64-39", source: "g1", target: "g2", type: "floatingEdge", label: "4", data: { weight: 4 }, style: { stroke: '#222121', strokeWidth: 1 }, markerEnd: { type: 'arrowclosed' as const, width: 25, height: 25, color: '#222121' } },
    { id: "eg-64-69", source: "g1", target: "g4", type: "floatingEdge", label: "1", data: { weight: 1 }, style: { stroke: '#222121', strokeWidth: 1 }, markerEnd: { type: 'arrowclosed' as const, width: 25, height: 25, color: '#222121' } },
    { id: "eg-39-97", source: "g2", target: "g3", type: "floatingEdge", label: "3", data: { weight: 3 }, style: { stroke: '#222121', strokeWidth: 1 }, markerEnd: { type: 'arrowclosed' as const, width: 25, height: 25, color: '#222121' } },
    { id: "eg-97-70", source: "g3", target: "g5", type: "floatingEdge", label: "1", data: { weight: 1 }, style: { stroke: '#222121', strokeWidth: 1 }, markerEnd: { type: 'arrowclosed' as const, width: 25, height: 25, color: '#222121' } },
];

export default function PlaygroundGraph({ algorithm }: { algorithm: string }) {
    // ── State Management ───────────────────────────────────────────────────────
    const [nodes, setNodes] = useState<Node[]>(graphInitialNodes);
    const [edges, setEdges] = useState<Edge[]>(graphInitialEdges);
    const [showInfo, setShowInfo] = useState(false);

    const { flowToScreenPosition } = useReactFlow();

    // ── Custom Hooks ───────────────────────────────────────────────────────────
    // Graph Tutorial hook
    const graphTutorial = useGraphTutorial({
        nodes, edges, flowToScreenPosition, setNodes, setEdges, isGraph: true,
    });

    // Node interaction (universal - works for graph interactions, active when NOT in tutorial)
    const nodeInteraction = useNodeInteraction({
        nodes, edges, setNodes, setEdges, isTree: false, isGraph: true,
        isTutorialActive: graphTutorial.showTutorial,
    });

    // ── React Flow Event Handlers ──────────────────────────────────────────────
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect: OnConnect = useCallback((connection) => {
        setEdges((eds) => addEdge(connection, eds));
    }, [setEdges]);

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // ── Custom Interaction Handlers ────────────────────────────────────────────
    // Edge click handler (for weight editing)
    const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        if (graphTutorial.showTutorial) {
            graphTutorial.handleWeightClick(edge.id);
        } else {
            nodeInteraction.handleEdgeClick(event, edge.id);
        }
    }, [graphTutorial, nodeInteraction]);

    // Combined node click handler
    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (graphTutorial.showTutorial) {
            graphTutorial.handleNodeClick(event, node);
        } else {
            nodeInteraction.handleNodeClick(event, node);
        }
    }, [graphTutorial, nodeInteraction]);

    // Combined node drag handlers
    const handleNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
        if (graphTutorial.showTutorial) return;
        nodeInteraction.handleNodeDragStart(event, node);
    }, [graphTutorial.showTutorial, nodeInteraction]);

    const handleNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
        if (graphTutorial.showTutorial) {
            graphTutorial.onNodeDrag(event, node);
        } else {
            nodeInteraction.handleNodeDrag(event, node);
        }
    }, [graphTutorial, nodeInteraction]);

    const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        if (graphTutorial.showTutorial) {
            graphTutorial.onNodeDragStop(event, node);
        } else {
            nodeInteraction.handleNodeDragStop(event, node);
        }
    }, [graphTutorial, nodeInteraction]);

    // Pane click to clear selection (universal)
    const handlePaneClick = useCallback(() => {
        if (!graphTutorial.showTutorial) {
            nodeInteraction.handlePaneClick();
        }
    }, [graphTutorial.showTutorial, nodeInteraction]);

    return (
        <div className="w-screen h-screen">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={graphTutorial.showTutorial ? undefined : onNodesChange}
                onEdgesChange={graphTutorial.showTutorial ? undefined : onEdgesChange}
                onConnect={onConnect}
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
                nodesDraggable={!graphTutorial.showTutorial || (graphTutorial.showTutorial && graphTutorial.tutorialStep === 8)}
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
                <ControlPanel />
            </div>

            <SideTab title="Graph Algorithms">
                <div>
                    <CodeAlgo tutorialMode={graphTutorial.showTutorial} />
                    <ExplainAlgo tutorialMode={graphTutorial.showTutorial} />
                    <Data_graph />
                </div>
                <div><PostTest_portal /></div>
            </SideTab>

            {/* Top Left Component show Info for reading how algo work & Status of Node in Playground Page */}
            <div className="absolute top-4 left-8 z-10 flex gap-2">
                <GoToHome_Portal />
                <button
                    onClick={(e) => { e.stopPropagation(); setShowInfo(true) }}
                    className="rounded-full bg-white p-2 border border-gray-200 shadow-lg hover:shadow-lg hover:bg-gray-100 transition cursor-pointer">
                    <Info color='#000000' />
                </button>
                <StatusNode />
            </div>

            {/* Info Reading inside Playground */}
            <Reading_modal isOpen={showInfo} onClose={() => setShowInfo(false)} />

            {/* Tutorial overlay for graph */}
            {graphTutorial.showTutorial && (
                <TutorialGraph
                    onComplete={graphTutorial.handleTutorialComplete}
                    currentStep={graphTutorial.tutorialStep}
                    setCurrentStep={graphTutorial.setTutorialStep}
                    node69ScreenPos={graphTutorial.node69ScreenPos}
                    node70ScreenPos={graphTutorial.node70ScreenPos}
                    edge64to39WeightPos={graphTutorial.edge64to39WeightPos}
                    trashBinPos={graphTutorial.trashBinPos}
                    isTrashActive={graphTutorial.isTrashActive}
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
                            onChange={(e) => nodeInteraction.handleWeightInputChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') nodeInteraction.handleWeightConfirm();
                                if (e.key === 'Escape') nodeInteraction.handleWeightModalClose();
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
                    tutorialContent={[{
                        title: "Tutorial Complete!",
                        description: "You are now ready to explore Graph Algorithms."
                    }]}
                />
            )}
        </div>
    );
}