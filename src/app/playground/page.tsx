'use client'
import React, { useState, useCallback } from 'react'
import ControlPanel from '../../components/shared/controlPanel'
import SideTab from '../../components/shared/sideTab'
import ExplainAlgo from '../../components/visualizer/explainAlgo'
import CodeAlgo from '../../components/visualizer/codeAlgo'
import Data_sort from '../../components/visualizer/data_sort'
import Tutorial_modal from '../../components/shared/tutorial_modal'
import {
    ReactFlow,
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
    { id: '1', data: { label: 'Node 1' }, position: { x: 5, y: 5 } },
    { id: '2', data: { label: 'Node 2' }, position: { x: 5, y: 100 } },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
    console.log('drag event', node.data);
};

export default function Page() {
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
                <div className='flex justify-center items-center mx-auto h-full'>
                    <Tutorial_modal/>

                </div>
                <Background />
            </ReactFlow>
            <div className="absolute top-4 w-full z-10">
                <ControlPanel />
            </div>


            {/* Add SideTab Component Here */}
            <SideTab title="Sorting Algorithms">
                <CodeAlgo />
                <ExplainAlgo />
                <Data_sort />
            </SideTab> 
        </div>
    )
}