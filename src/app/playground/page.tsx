"use client";
import React, { useState, useCallback, Suspense, DragEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Data_sort from "../../components/visualizer/data_sort";
import { DnDProvider, useDnD } from "@/src/components/visualizer/useDnD";
import Tutorial_modal from "../../components/shared/tutorial_modal";
import Tutorial from "../../components/visualizer/tutorial";
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
    type OnNodeDrag,
    type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Data_tree from "@/src/components/visualizer/data_tree";
import Data_graph from "@/src/components/visualizer/data_graph";
import CustomNode from "@/src/components/shared/customNode";
import TreeEdge from "@/src/components/shared/treeEdge";
import '@xyflow/react/dist/base.css';

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    tree: TreeEdge,
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

const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
    console.log("drag event", node.data);
};

let id = 0;
const getId = (): string => `dndnode_${id++}`;

function Playground() {
    const searchParams = useSearchParams();
    const algoType = searchParams.get("type");

    // Set initial nodes and edges based on algorithm type
    const isTree = algoType === "tree";
    const [nodes, setNodes] = useState<Node[]>(isTree ? treeInitialNodes : sortingInitialNodes);
    const [edges, setEdges] = useState<Edge[]>(isTree ? treeInitialEdges : sortingInitialEdges);

    // Tutorial state
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Dynamic screen positions for tutorial spotlight/tooltips
    const [droppedNodeScreenPos, setDroppedNodeScreenPos] = useState<{ x: number; y: number } | null>(null);
    const [node30ScreenPos, setNode30ScreenPos] = useState<{ x: number; y: number } | null>(null);
    const [node90ScreenPos, setNode90ScreenPos] = useState<{ x: number; y: number } | null>(null);
    const { flowToScreenPosition } = useReactFlow();

    // Compute screen positions for nodes when nodes change
    useEffect(() => {
        if (showTutorial) {
            // Find dropped node 3 (id starts with 'dndnode_')
            const droppedNode = nodes.find(n => n.id.startsWith('dndnode_'));
            if (droppedNode) {
                const screenPos = flowToScreenPosition({
                    x: droppedNode.position.x + 28, // Center of node (56px / 2)
                    y: droppedNode.position.y + 28,
                });
                setDroppedNodeScreenPos(screenPos);
            }

            // Find node 30 (label === "30")
            const node30 = nodes.find(n => n.data?.label === '30' || n.data?.label === 30);
            if (node30) {
                const screenPos = flowToScreenPosition({
                    x: node30.position.x + 28, // Center of node
                    y: node30.position.y + 28,
                });
                setNode30ScreenPos(screenPos);
            }

            // Find node 90 (label === "90") for step 5
            const node90 = nodes.find(n => n.data?.label === '90' || n.data?.label === 90);
            if (node90) {
                const screenPos = flowToScreenPosition({
                    x: node90.position.x + 28, // Center of node
                    y: node90.position.y + 28,
                });
                setNode90ScreenPos(screenPos);
            }
        }
    }, [nodes, showTutorial, flowToScreenPosition]);

    // Check if user needs to see tutorial (default: show if tree type)
    useEffect(() => {
        if (isTree) {
            // TODO: Check Firebase here
            // Default: show tutorial since backend not ready
            setShowTutorial(true);
        }
    }, [isTree]);

    const handleTutorialComplete = useCallback(() => {
        setShowTutorial(false);
        setShowCompletionModal(true);
        // TODO: POST to Firebase to mark tutorial as completed
    }, []);

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
            if (showTutorial && tutorialStep === 2) {
                setTutorialStep(3);
            }
        },
        [setEdges, showTutorial, tutorialStep],
    );

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Track selected node for linking in tutorial
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Handle node click for tutorial
    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (showTutorial) {
            if (tutorialStep === 1) {
                // Step 2: Only allow clicking node 3 (the dropped node starts with 'dndnode_')
                if (node.id.startsWith('dndnode_') && node.data.label === '3') {
                    // Highlight node 3 and set it as selected
                    setNodes(nds => nds.map(n => ({
                        ...n,
                        data: {
                            ...n.data,
                            isHighlighted: n.id === node.id,
                            isGlowing: n.id === node.id,
                        }
                    })));
                    setSelectedNodeId(node.id);
                    setTutorialStep(2);
                }
            } else if (tutorialStep === 2) {
                // Step 3: Only allow clicking node 30 (t2)
                if (node.data.label === '30') {
                    // Create edge from node 3 to node 30
                    if (selectedNodeId) {
                        const newEdge: Edge = {
                            id: `e-${selectedNodeId}-${node.id}`,
                            source: node.id,  // Parent is node 30
                            sourceHandle: 'source-bottom-left',
                            target: selectedNodeId,  // Child is node 3
                            targetHandle: 'target-top-right',
                            type: 'straight',
                            // Highlight the new edge
                            style: { stroke: '#333', strokeWidth: 2 },
                        };
                        setEdges(eds => [...eds, newEdge]);
                    }
                    // Remove glow from node 3
                    setNodes(nds => nds.map(n => ({
                        ...n,
                        data: {
                            ...n.data,
                            isHighlighted: false,
                            isGlowing: false,
                        }
                    })));
                    setSelectedNodeId(null);
                    setTutorialStep(3);
                }
            }
        }
    }, [showTutorial, tutorialStep, selectedNodeId, setNodes, setEdges]);

    const handleTutorialDropSuccess = useCallback(() => {
        if (showTutorial && tutorialStep === 0) {
            setTutorialStep(1);
        }
    }, [showTutorial, tutorialStep]);

    const renderDataVisualizer = () => {
        switch (algoType) {
            case "tree":
                return (
                    <Data_tree
                        tutorialMode={showTutorial}
                        tutorialStep={tutorialStep}
                        onTutorialDropSuccess={handleTutorialDropSuccess}
                    />
                );
            case 'graph':
                return <Data_graph />;
            default:
                return <Data_sort nodeInput={0} setNodeInput={function (value: React.SetStateAction<number>): void {
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
                onNodesChange={showTutorial ? undefined : onNodesChange}
                onEdgesChange={showTutorial ? undefined : onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onDragOver={onDragOver}
                onNodeClick={handleNodeClick}
                panOnDrag={!showTutorial}
                zoomOnScroll={!showTutorial}
                zoomOnPinch={!showTutorial}
                zoomOnDoubleClick={!showTutorial}
                nodesDraggable={!showTutorial}
                fitView
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
                onNodeDrag={onNodeDrag}
            >
                <Background />
                {!showTutorial && <Controls />}
            </ReactFlow>

            <div className="absolute bottom-4 w-full z-10">
                <ControlPanel />
            </div>

            <SideTab title={getTitle()}>
                <CodeAlgo tutorialMode={showTutorial} />
                <ExplainAlgo tutorialMode={showTutorial} />
                {renderDataVisualizer()}
            </SideTab>

            {/* Tutorial overlay for tree */}
            {showTutorial && isTree && (
                <Tutorial
                    onComplete={handleTutorialComplete}
                    currentStep={tutorialStep}
                    setCurrentStep={setTutorialStep}
                    droppedNodeScreenPos={droppedNodeScreenPos}
                    node30ScreenPos={node30ScreenPos}
                />
            )}

            {/* Completion modal */}
            {showCompletionModal && (
                <Tutorial_modal
                    showModal={showCompletionModal}
                    onClose={() => setShowCompletionModal(false)}
                    tutorialContent={[{
                        title: "Tutorial Complete!",
                        description: "You are now ready to explore Binary Search Tree."
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