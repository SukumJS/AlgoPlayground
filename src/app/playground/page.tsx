"use client";
import React, { useState, useCallback, Suspense, DragEvent } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Data_sort from "../../components/visualizer/data_sort";
import { DnDProvider } from "@/src/components/visualizer/useDnD";
import Tutorial_modal from "../../components/shared/tutorial_modal";
import TutorialTree from "../../components/visualizer/tutorial_tree";
import TutorialGraph from "../../components/visualizer/tutorial_graph";
import TreeTrashBin from "../../components/visualizer/TreeTrashBin";
import { useTreeTutorial } from "@/src/hooks/useTreeTutorial";
import { useGraphTutorial } from "@/src/hooks/useGraphTutorial";
import { useTreeNodeInteraction } from "@/src/hooks/useTreeNodeInteraction";
import {
    ReactFlow,
    ReactFlowProvider,
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
import Data_tree from "@/src/components/visualizer/data_tree";
import Data_graph from "@/src/components/visualizer/data_graph";
import CustomNode from "@/src/components/shared/customNode";
import TreeEdge from "@/src/components/shared/treeEdge";
import FloatingEdge from "@/src/components/shared/FloatingEdge";
import '@xyflow/react/dist/base.css';

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    tree: TreeEdge,
    floatingEdge: FloatingEdge,
};

// Initial nodes for sorting (horizontal layout)
const sortingInitialNodes: Node[] = [
    { id: "1", type: "custom", data: { label: "1" }, position: { x: -50, y: 5 } },
    { id: "2", type: "custom", data: { label: "2" }, position: { x: 15, y: 5 } },
    { id: "3", type: "custom", data: { label: "3" }, position: { x: 80, y: 5 } },
    { id: "4", type: "custom", data: { label: "4" }, position: { x: 145, y: 5 } },
    { id: "5", type: "custom", data: { label: "5" }, position: { x: 210, y: 5 } },
];

// Initial nodes for tree (BST layout with circle variant)
const treeInitialNodes: Node[] = [
    { id: "t1", type: "custom", data: { label: "64", variant: "circle" }, position: { x: 200, y: 50 } },
    { id: "t2", type: "custom", data: { label: "30", variant: "circle" }, position: { x: 100, y: 150 } },
    { id: "t3", type: "custom", data: { label: "70", variant: "circle" }, position: { x: 300, y: 150 } },
    { id: "t4", type: "custom", data: { label: "80", variant: "circle" }, position: { x: 375, y: 250 } },
    { id: "t5", type: "custom", data: { label: "90", variant: "circle" }, position: { x: 450, y: 350 } },
];

// Initial edges for tree (BST structure) - straight lines at 45° angles
const treeInitialEdges: Edge[] = [
    { id: "e-t1-t2", source: "t1", sourceHandle: "source-bottom-left", target: "t2", targetHandle: "target-top-right", type: "straight" },
    { id: "e-t1-t3", source: "t1", sourceHandle: "source-bottom-right", target: "t3", targetHandle: "target-top-left", type: "straight" },
    { id: "e-t3-t4", source: "t3", sourceHandle: "source-bottom-right", target: "t4", targetHandle: "target-top-left", type: "straight" },
    { id: "e-t4-t5", source: "t4", sourceHandle: "source-bottom-right", target: "t5", targetHandle: "target-top-left", type: "straight" },
];

const sortingInitialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

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

const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
};

function Playground() {
    const searchParams = useSearchParams();
    const algoType = searchParams.get("type");

    // Set initial nodes and edges based on algorithm type
    const isTree = algoType === "tree";
    const isGraph = algoType === "graph";

    const getInitialNodes = () => {
        if (isTree) return treeInitialNodes;
        if (isGraph) return graphInitialNodes;
        return sortingInitialNodes;
    };

    const getInitialEdges = () => {
        if (isTree) return treeInitialEdges;
        if (isGraph) return graphInitialEdges;
        return sortingInitialEdges;
    };

    const [nodes, setNodes] = useState<Node[]>(getInitialNodes());
    const [edges, setEdges] = useState<Edge[]>(getInitialEdges());
    const { flowToScreenPosition } = useReactFlow();

    // Tutorial logic extracted to custom hook
    const tutorial = useTreeTutorial({
        nodes,
        flowToScreenPosition,
        setNodes,
        setEdges,
        isTree,
    });

    // Graph Tutorial hook
    const graphTutorial = useGraphTutorial({
        nodes,
        edges,
        flowToScreenPosition,
        setNodes,
        setEdges,
        isGraph,
    });

    // Node interaction (only active when NOT in tutorial)
    const nodeInteraction = useTreeNodeInteraction({
        nodes,
        edges,
        setNodes,
        setEdges,
        isTree,
        isTutorialActive: tutorial.showTutorial || graphTutorial.showTutorial,
    });

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
            // If in tutorial step 3 (connect), advance to next step
            if (tutorial.showTutorial && tutorial.tutorialStep === 2) {
                tutorial.setTutorialStep(3);
            }
        },
        [setEdges, tutorial],
    );

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Edge click handler (for weight editing in graph tutorial)
    const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        if (graphTutorial.showTutorial && isGraph) {
            graphTutorial.handleWeightClick(edge.id);
        }
    }, [graphTutorial, isGraph]);

    // Combined node click handler
    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (tutorial.showTutorial && isTree) {
            tutorial.handleNodeClick(event, node);
        } else if (graphTutorial.showTutorial && isGraph) {
            graphTutorial.handleNodeClick(event, node);
        } else if (isTree) {
            nodeInteraction.handleNodeClick(event, node);
        }
    }, [tutorial, graphTutorial, nodeInteraction, isTree, isGraph]);

    // Combined node drag handlers
    const handleNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
        if (tutorial.showTutorial && isTree) {
            tutorial.onNodeDrag(event, node);
        } else if (graphTutorial.showTutorial && isGraph) {
            graphTutorial.onNodeDrag(event, node);
        } else if (isTree) {
            nodeInteraction.handleNodeDrag(event, node);
        }
    }, [tutorial, graphTutorial, nodeInteraction, isTree, isGraph]);

    const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        if (tutorial.showTutorial && isTree) {
            tutorial.onNodeDragStop(event, node);
        } else if (graphTutorial.showTutorial && isGraph) {
            graphTutorial.onNodeDragStop(event, node);
        } else if (isTree) {
            nodeInteraction.handleNodeDragStop(event, node);
        }
    }, [tutorial, graphTutorial, nodeInteraction, isTree, isGraph]);

    // Node mouse down/up for hold detection
    const handleNodeMouseDown = useCallback((event: React.MouseEvent, node: Node) => {
        if (!tutorial.showTutorial && isTree) {
            nodeInteraction.handleNodeMouseDown(event, node);
        }
    }, [tutorial.showTutorial, nodeInteraction, isTree]);

    const handleNodeMouseUp = useCallback(() => {
        if (!tutorial.showTutorial && isTree) {
            nodeInteraction.handleNodeMouseUp();
        }
    }, [tutorial.showTutorial, nodeInteraction, isTree]);

    // Pane click to clear selection
    const handlePaneClick = useCallback(() => {
        if (!tutorial.showTutorial && isTree) {
            nodeInteraction.handlePaneClick();
        }
    }, [tutorial.showTutorial, nodeInteraction, isTree]);

    const renderDataVisualizer = () => {
        const treeNodes = nodes
            .filter(node => node.type === "custom" && typeof node.data === 'object' && 'label' in node.data)
            .map(node => ({
                id: node.id,
                data: { label: (node.data as Record<string, unknown>).label as string }
            }));

        switch (algoType) {
            case "tree":
                return (
                    <Data_tree
                        tutorialMode={tutorial.showTutorial}
                        tutorialStep={tutorial.tutorialStep}
                        onTutorialDropSuccess={tutorial.handleTutorialDropSuccess}
                        currentNodes={treeNodes}
                    />
                );
            case 'graph':
                return <Data_graph />;
            default:
                return <Data_sort nodeInput={0} setNodeInput={function (): void {
                    throw new Error("Function not implemented.");
                }} />;
        }
    };

    const getTitle = () => {
        switch (algoType) {
            case "tree":
                return "Tree Algorithms";
            case 'graph':
                return 'Graph Algorithms';
            default:
                return "Sorting Algorithms";
        }
    };

    return (
        <div className="w-screen h-screen">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={(tutorial.showTutorial || graphTutorial.showTutorial) ? undefined : onNodesChange}
                onEdgesChange={(tutorial.showTutorial || graphTutorial.showTutorial) ? undefined : onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onDragOver={onDragOver}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onNodeMouseEnter={handleNodeMouseDown}
                onNodeMouseLeave={handleNodeMouseUp}
                onPaneClick={handlePaneClick}
                panOnDrag={!(tutorial.showTutorial || graphTutorial.showTutorial)}
                zoomOnScroll={!(tutorial.showTutorial || graphTutorial.showTutorial)}
                zoomOnPinch={!(tutorial.showTutorial || graphTutorial.showTutorial)}
                zoomOnDoubleClick={!(tutorial.showTutorial || graphTutorial.showTutorial)}
                nodesDraggable={!(tutorial.showTutorial || graphTutorial.showTutorial) || (tutorial.showTutorial && tutorial.tutorialStep === 5) || (graphTutorial.showTutorial && graphTutorial.tutorialStep === 8)}
                onNodeDrag={handleNodeDrag}
                onNodeDragStop={handleNodeDragStop}
                fitView
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Background />
                {!(tutorial.showTutorial || graphTutorial.showTutorial) && <Controls />}
            </ReactFlow>

            <div className="absolute bottom-4 w-full z-10">
                <ControlPanel />
            </div>

            <SideTab title={getTitle()}>
                <CodeAlgo tutorialMode={tutorial.showTutorial || graphTutorial.showTutorial} />
                <ExplainAlgo tutorialMode={tutorial.showTutorial || graphTutorial.showTutorial} />
                {renderDataVisualizer()}
            </SideTab>

            {/* Tutorial overlay for tree */}
            {tutorial.showTutorial && isTree && (
                <TutorialTree
                    onComplete={tutorial.handleTutorialComplete}
                    currentStep={tutorial.tutorialStep}
                    setCurrentStep={tutorial.setTutorialStep}
                    droppedNodeScreenPos={tutorial.droppedNodeScreenPos}
                    node30ScreenPos={tutorial.node30ScreenPos}
                    node90ScreenPos={tutorial.node90ScreenPos}
                    sidebarNode3Pos={tutorial.sidebarNode3Pos}
                    isTrashActive={tutorial.isTrashActive}
                    trashBinPos={tutorial.trashBinPos}
                />
            )}

            {/* Tutorial overlay for graph */}
            {graphTutorial.showTutorial && isGraph && (
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

            {/* Tree trash bin (non-tutorial mode) */}
            {!tutorial.showTutorial && isTree && (
                <TreeTrashBin
                    show={nodeInteraction.showTrashBin}
                    isActive={nodeInteraction.isTrashActive}
                    position={nodeInteraction.trashBinPos}
                />
            )}

            {/* Completion modal for tree */}
            {tutorial.showCompletionModal && (
                <Tutorial_modal
                    showModal={tutorial.showCompletionModal}
                    onClose={() => tutorial.setShowCompletionModal(false)}
                    tutorialContent={[{
                        title: "Tutorial Complete!",
                        description: "You are now ready to explore Binary Search Tree."
                    }]}
                />
            )}

            {/* Completion modal for graph */}
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

export default function Page() {
    return (
        <ReactFlowProvider>
            <DnDProvider>
                <Suspense fallback={<div>Loading...</div>}>
                    <Playground />
                </Suspense>
            </DnDProvider>
        </ReactFlowProvider>
    );
}