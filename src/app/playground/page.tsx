"use client";
import React, { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Data_sort from "../../components/visualizer/data_sort";
import { DnDProvider } from "../../components/visualizer/useDnD";
import Tutorial_modal from "../../components/shared/tutorial_modal";
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
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

const initialNodes: Node[] = [
    { id: "1", data: { label: "Node 1" }, position: { x: 5, y: 5 } },
    { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 100 } },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
    console.log("drag event", node.data);
};

function Playground() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type");
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );
    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges],
    );

    const renderDataVisualizer = () => {
        switch (type) {
        case "tree":
            return <Data_tree />;
        // case 'graph':
        //     return <Data_graph />;
        default:
            return <Data_sort />;
        }
    };

    const getTitle = () => {
        switch (type) {
        case "tree":
            return "Tree Algorithms";
        // case 'graph':
        //     return 'Graph Algorithms';
        default:
            return "Sorting Algorithms";
        }
    };

    return (
        <div className="w-screen h-screen">
        {/* Implement Change page to canvas */}
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={fitViewOptions}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodeDrag={onNodeDrag}
        >
            <Background />
        </ReactFlow>
        <div className="absolute bottom-4 w-full z-10">
            <ControlPanel />
        </div>
        {/* This container overlays the canvas to center the modal */}
        <div className="absolute inset-0 flex justify-center items-center z-20 pointer-events-none">
            {/* This wrapper re-enables pointer events for the modal itself */}
            <div className="pointer-events-auto">
            <Tutorial_modal />
            </div>
        </div>

        {/* Add SideTab Component Here */}
        <SideTab title={getTitle()}>
            <CodeAlgo />
            <ExplainAlgo />
            {renderDataVisualizer()}
        </SideTab>
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
