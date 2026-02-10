"use client";
import React, { useState, useCallback, Suspense, DragEvent } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Data_sort from "../../components/visualizer/data_sort";
import { DnDProvider, useDnD } from "@/src/components/visualizer/useDnD";
import Tutorial_modal from "../../components/shared/tutorial_modal";
import PostTest_portal from "@/src/components/shared/postTest_portal";
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Controls,
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
import '@xyflow/react/dist/base.css';
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";

const nodeTypes = {
    custom: CustomNode,
};

/* This block of code is setting up initial data for a visualizer component using ReactFlow library in
a TypeScript React application. Here's a breakdown of what each constant is doing: */
const initialNodes: Node[] = [
    { id: "1", type: "custom", data: { label : "1" }, position: { x: -50, y: 5 }},
    { id: "2", type: "custom", data: { label: "2" }, position: { x: 15, y: 5}},
    { id: "3", type: "custom", data: { label: "3" }, position: { x: 80, y: 5}},
    { id: "4", type: "custom", data: { label: "4" }, position: { x: 145, y: 5}},
    { id: "5", type: "custom", data: { label: "5" }, position: { x: 210, y: 5}},
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

/*  defining a function `getId` that returns a string value with a dynamic ID. */
let id = 0;
const getId = (): string => `dndnode_${id++}`;

function Playground() {
    const searchParams = useSearchParams();
    const algoType = searchParams.get("type");
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [showTutorial, setShowTutorial] = useState(true);
    const [showInfo, setShowInfo] = useState(false);

    /* These three constants are defining functions that handle changes to nodes, edges, and
    connections in the ReactFlow component. */
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

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    {/*Check Type & Display Data Input of Current Algorithms */}
    const renderDataVisualizer = () => {
        switch (algoType) {
        case "tree":
            return <Data_tree />;
        case 'graph':
            return <Data_graph />;
        default:
            return <Data_sort nodeInput={0} setNodeInput={function (value: React.SetStateAction<number>): void {
                throw new Error("Function not implemented.");
            } } />;
        }
    };

    {/*Check Type & Display Title of Current Algorithms */}
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
            {/* Implement Change page to canvas */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onDragOver={onDragOver}
                fitView
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
                onNodeDrag={onNodeDrag}
            >
                <Background />
                <Controls />
            </ReactFlow>

        <div className="absolute bottom-4 w-full z-10">
            <ControlPanel />
        </div>
        
        {/* Add SideTab Component Here */}
        <SideTab title={getTitle()}>
            <div>
                <CodeAlgo />
                <ExplainAlgo />
                {renderDataVisualizer()}
            </div>
            <div>
                <PostTest_portal />
            </div>
        </SideTab>

        {/*Top Left Component show Info for reading how algo work & Status of Node in Playground Page */}
        <div className="absolute top-4 left-8 z-10 flex gap-2">
            <button
            onClick={(e) => {
                e.stopPropagation();
                setShowInfo(true)}}
            className="rounded-full bg-white p-2 border border-gray-200 shadow-lg hover:shadow-lg hover:bg-gray-100 transition">
                <Info color='#000000' />
            </button>
            <StatusNode />  
        </div>

        {/* Info Reading inside Playground */}
        <Reading_modal 
        isOpen={showInfo} 
        onClose={() => setShowInfo(false)} />

        
        {/* STutorial Complelte Modal Show When User Finish Tutorial */}
        {/* <Tutorial_modal
            showModal={showTutorial}
            onClose={() => setShowTutorial(false)}
            tutorialContent={[{
                title: "Tutorial Complete!",
                description: "You are ready to play."
            }]} 
        /> */}
            
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