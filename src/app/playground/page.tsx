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
import TutorialTree from "../../components/visualizer/tutorial_tree";
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
    const [sidebarNode3Pos, setSidebarNode3Pos] = useState<{ x: number; y: number } | null>(null);
    const [trashBinPos, setTrashBinPos] = useState<{ x: number; y: number } | null>(null);
    const [isTrashActive, setIsTrashActive] = useState(false);
    const { flowToScreenPosition } = useReactFlow();

    // Compute screen positions for nodes when nodes change or window resizes
    const updateTutorialPositions = useCallback(() => {
        if (!showTutorial) return;

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

        // Find Sidebar Node 3 for Step 1 spotlight
        // We use a DOM selector approach since it's outside React Flow
        const sidebarNodes = Array.from(document.querySelectorAll('div'));
        const targetNode = sidebarNodes.find(el =>
            el.textContent?.trim() === '3' &&
            el.getBoundingClientRect().left > window.innerWidth / 2 // Ensure it's in the right sidebar
        );
        if (targetNode) {
            const rect = targetNode.getBoundingClientRect();
            setSidebarNode3Pos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });
        }

        // Trash bin position logic (matches tutorial.tsx CSS)
        // bottom: 140px, left: 50%
        setTrashBinPos({
            x: window.innerWidth / 2,
            y: window.innerHeight - 140
        });

    }, [nodes, showTutorial, flowToScreenPosition]);

    // Initial position update & Resize listener
    useEffect(() => {
        updateTutorialPositions();

        window.addEventListener('resize', updateTutorialPositions);
        return () => window.removeEventListener('resize', updateTutorialPositions);
    }, [updateTutorialPositions]);

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

    const onNodeDrag: OnNodeDrag = useCallback((event, node) => {
        if (showTutorial && tutorialStep === 5) {
            const trashX = window.innerWidth / 2;
            const trashY = window.innerHeight - 140;
            const dropTargetRadius = 150; // Glow activation radius

            // Calculate distance
            const dist = Math.sqrt(Math.pow(event.clientX - trashX, 2) + Math.pow(event.clientY - trashY, 2));

            setIsTrashActive(dist < dropTargetRadius);
        }
    }, [showTutorial, tutorialStep]);
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
                            // style: { stroke: '#333', strokeWidth: 2 }, // Link should not have strong stroke anymore
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
            } else if (tutorialStep === 4) {
                // Step 5: Press Node 90
                if (node.data.label === '90' || node.data.label === 90) {
                    setNodes(nds => nds.map(n => ({
                        ...n,
                        data: {
                            ...n.data,
                            isHighlighted: n.id === node.id, // Highlight Node 90
                            isGlowing: n.id === node.id,
                        }
                    })));
                    setTutorialStep(5); // Move to Step 6 (Drag to Trash)
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
                nodesDraggable={!showTutorial || (showTutorial && tutorialStep === 5)} // Allow drag only in Step 6 (index 5)
                onNodeDragStop={(e, node) => {
                    if (showTutorial && tutorialStep === 5) {
                        // Trash bin position logic (matches tutorial.tsx CSS)
                        // bottom: 140px, left: 50%
                        const trashX = window.innerWidth / 2;
                        const trashY = window.innerHeight - 140;
                        const dropTargetRadius = 60; // Hit radius

                        // Calculate drop distance
                        const dist = Math.sqrt(Math.pow(e.clientX - trashX, 2) + Math.pow(e.clientY - trashY, 2));

                        if (dist < dropTargetRadius) {
                            // Delete the node
                            setNodes(nds => nds.filter(n => n.id !== node.id));
                            // Complete tutorial
                            handleTutorialComplete();
                        }
                    }
                }}
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
                <TutorialTree
                    onComplete={handleTutorialComplete}
                    currentStep={tutorialStep}
                    setCurrentStep={setTutorialStep}
                    droppedNodeScreenPos={droppedNodeScreenPos}
                    node30ScreenPos={node30ScreenPos}
                    node90ScreenPos={node90ScreenPos}
                    sidebarNode3Pos={sidebarNode3Pos}
                    isTrashActive={isTrashActive}
                    trashBinPos={trashBinPos}
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