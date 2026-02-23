"use client";
import React, { useState, useCallback, DragEvent } from "react";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import PostTest_portal from "@/src/components/shared/postTest_portal";
import TreeTrashBin from "../../components/visualizer/TreeTrashBin";
import { useNodeInteraction } from "@/src/hooks/useNodeInteraction";
import {
    ReactFlow,
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
    type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import '@xyflow/react/dist/base.css';
import Data_sort from "../../components/visualizer/data_sort";
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

const initialNodes: Node[] = [
    { id: "1", type: "custom", data: { label: "1" }, position: { x: -50, y: 5 } },
    { id: "2", type: "custom", data: { label: "2" }, position: { x: 15, y: 5 } },
    { id: "3", type: "custom", data: { label: "3" }, position: { x: 80, y: 5 } },
    { id: "4", type: "custom", data: { label: "4" }, position: { x: 145, y: 5 } },
    { id: "5", type: "custom", data: { label: "5" }, position: { x: 210, y: 5 } },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

export default function PlaygroundSort({ algorithm }: { algorithm: string }) {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [showInfo, setShowInfo] = useState(false);

    const nodeInteraction = useNodeInteraction({
        nodes, edges, setNodes, setEdges, isTree: false, isGraph: false,
        isTutorialActive: false,
    });

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

    const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        nodeInteraction.handleEdgeClick(event, edge.id);
    }, [nodeInteraction]);

    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        nodeInteraction.handleNodeClick(event, node);
    }, [nodeInteraction]);

    const handleNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
        nodeInteraction.handleNodeDragStart(event, node);
    }, [nodeInteraction]);

    const handleNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
        nodeInteraction.handleNodeDrag(event, node);
    }, [nodeInteraction]);

    const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        nodeInteraction.handleNodeDragStop(event, node);
    }, [nodeInteraction]);

    const handlePaneClick = useCallback(() => {
        nodeInteraction.handlePaneClick();
    }, [nodeInteraction]);

    return (
        <div className="w-screen h-screen">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onDragOver={onDragOver}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onNodeDragStart={handleNodeDragStart}
                onPaneClick={handlePaneClick}
                onNodeDrag={handleNodeDrag}
                onNodeDragStop={handleNodeDragStop}
                fitView
                fitViewOptions={fitViewOptions}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Background />
                <Controls />
            </ReactFlow>

            <div className="absolute bottom-4 w-full z-10">
                <ControlPanel />
            </div>

            <SideTab title="Sorting Algorithms">
                <div>
                    <CodeAlgo tutorialMode={false} />
                    <ExplainAlgo tutorialMode={false} />
                    <Data_sort
                        nodeInput={0}
                        setNodeInput={function (): void {
                            throw new Error("Function not implemented.");
                        }}
                    />
                </div>
                <div><PostTest_portal /></div>
            </SideTab>

            <div className="absolute top-4 left-8 z-10 flex gap-2">
                <GoToHome_Portal />
                <button
                    onClick={(e) => { e.stopPropagation(); setShowInfo(true) }}
                    className="rounded-full bg-white p-2 border border-gray-200 shadow-lg hover:shadow-lg hover:bg-gray-100 transition cursor-pointer">
                    <Info color='#000000' />
                </button>
                <StatusNode />
            </div>

            <Reading_modal isOpen={showInfo} onClose={() => setShowInfo(false)} />

            <TreeTrashBin
                show={nodeInteraction.showTrashBin}
                isActive={nodeInteraction.isTrashActive}
                position={nodeInteraction.trashBinPos}
            />
        </div>
    );
}