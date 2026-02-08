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
import { useTreeTutorial } from "@/src/hooks/useTreeTutorial";
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

function Playground() {
    const searchParams = useSearchParams();
    const algoType = searchParams.get("type");

    // Set initial nodes and edges based on algorithm type
    const isTree = algoType === "tree";
    const [nodes, setNodes] = useState<Node[]>(isTree ? treeInitialNodes : sortingInitialNodes);
    const [edges, setEdges] = useState<Edge[]>(isTree ? treeInitialEdges : sortingInitialEdges);
    const { flowToScreenPosition } = useReactFlow();

    // Tutorial logic extracted to custom hook
    const tutorial = useTreeTutorial({
        nodes,
        flowToScreenPosition,
        setNodes,
        setEdges,
        isTree,
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

    const renderDataVisualizer = () => {
        switch (algoType) {
            case "tree":
                return (
                    <Data_tree
                        tutorialMode={tutorial.showTutorial}
                        tutorialStep={tutorial.tutorialStep}
                        onTutorialDropSuccess={tutorial.handleTutorialDropSuccess}
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
                onNodesChange={tutorial.showTutorial ? undefined : onNodesChange}
                onEdgesChange={tutorial.showTutorial ? undefined : onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onDragOver={onDragOver}
                onNodeClick={tutorial.handleNodeClick}
                panOnDrag={!tutorial.showTutorial}
                zoomOnScroll={!tutorial.showTutorial}
                zoomOnPinch={!tutorial.showTutorial}
                zoomOnDoubleClick={!tutorial.showTutorial}
                nodesDraggable={!tutorial.showTutorial || (tutorial.showTutorial && tutorial.tutorialStep === 5)}
                onNodeDrag={tutorial.onNodeDrag}
                onNodeDragStop={tutorial.onNodeDragStop}
                fitView
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Background />
                {!tutorial.showTutorial && <Controls />}
            </ReactFlow>

            <div className="absolute bottom-4 w-full z-10">
                <ControlPanel />
            </div>

            <SideTab title={getTitle()}>
                <CodeAlgo tutorialMode={tutorial.showTutorial} />
                <ExplainAlgo tutorialMode={tutorial.showTutorial} />
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

            {/* Completion modal */}
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