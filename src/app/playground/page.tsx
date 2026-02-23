"use client";
import React, { useState, useCallback, Suspense, DragEvent, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "../../components/shared/controlPanel";
import SideTab from "../../components/shared/sideTab";
import ExplainAlgo from "../../components/visualizer/explainAlgo";
import CodeAlgo from "../../components/visualizer/codeAlgo";
import Data_sort from "../../components/visualizer/data_sort";
import { DnDProvider } from "@/src/components/visualizer/useDnD";
import Tutorial_modal from "../../components/shared/tutorial_modal";
import PostTest_portal from "@/src/components/shared/postTest_portal";
import TutorialTree from "../../components/visualizer/tutorial_tree";
import TutorialGraph from "../../components/visualizer/tutorial_graph";
import TreeTrashBin from "../../components/visualizer/TreeTrashBin";
import { useTreeTutorial } from "@/src/hooks/useTreeTutorial";
import { useGraphTutorial } from "@/src/hooks/useGraphTutorial";
import { useNodeInteraction } from "@/src/hooks/useNodeInteraction";
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
import { insertBST, type BSTNode } from "@/src/components/visualizer/algorithmsTree/bstTree";
import { insertBT, type BTNode } from "@/src/components/visualizer/algorithmsTree/binaryTree";
import { insertHeap, type HeapNode } from "@/src/components/visualizer/algorithmsTree/heapTree";
import { insertAVL, type AVLTreeNode } from "@/src/components/visualizer/algorithmsTree/avlTree";
import Reading_modal from "@/src/components/shared/reading_modal";
import { Info } from "lucide-react";
import StatusNode from "@/src/components/shared/statusNode";
import GoToHome_Portal from "@/src/components/shared/goToHome_Portal";

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    tree: TreeEdge,
    floatingEdge: FloatingEdge,
};

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

const initialNodes: Node[] = [
    { id: "1", type: "custom", data: { label: "1" }, position: { x: -50, y: 5 } },
    { id: "2", type: "custom", data: { label: "2" }, position: { x: 15, y: 5 } },
    { id: "3", type: "custom", data: { label: "3" }, position: { x: 80, y: 5 } },
    { id: "4", type: "custom", data: { label: "4" }, position: { x: 145, y: 5 } },
    { id: "5", type: "custom", data: { label: "5" }, position: { x: 210, y: 5 } },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

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

// ── Build initial BST from treeInitialNodes ───────────────────────────────────
const buildTreeInitialBSTRoot = (): BSTNode => {
    // t1=64 (root), t2=30, t3=70, t4=80, t5=90
    const insertOrder: Array<{ id: string; value: number }> = [
        { id: "t1", value: 64 },
        { id: "t2", value: 30 },
        { id: "t3", value: 70 },
        { id: "t4", value: 80 },
    ];
    let root: BSTNode | null = null;
    for (const { id, value } of insertOrder) {
        root = insertBST(root, value, id);
    }
    return root!;
};

// ── Build initial BT root (สำหรับ bt-inorder, bt-preorder, bt-postorder) ────
const buildTreeInitialBTRoot = (): BTNode => {
    const insertOrder: Array<{ id: string; value: number }> = [
        { id: "t1", value: 64 },
        { id: "t2", value: 30 },
        { id: "t3", value: 70 },
        { id: "t4", value: 80 },
    ];
    let root: BTNode | null = null;
    for (const { id, value } of insertOrder) {
        root = insertBT(root, value, id);
    }
    return root!;
};

// ── Build initial AVL root ────────────────────────────────────────────────────
const buildTreeInitialAVLRoot = (): AVLTreeNode => {
    const insertOrder: Array<{ id: string; value: number }> = [
        { id: "t1", value: 64 },
        { id: "t2", value: 30 },
        { id: "t3", value: 70 },
        { id: "t4", value: 80 },
    ];
    let root: AVLTreeNode | null = null;
    for (const { id, value } of insertOrder) {
        root = insertAVL(root, value, id);
    }
    return root!;
};

const treeInitialBTRoot = buildTreeInitialBTRoot();
const treeInitialBSTRoot = buildTreeInitialBSTRoot();
const treeInitialAVLRoot = buildTreeInitialAVLRoot();

// ── Build initial Heap root (for min-heap / max-heap) ─────────────────────────
const buildTreeInitialHeapRoot = (isMinHeap: boolean): HeapNode => {
    const insertOrder: Array<{ id: string; value: number }> = [
        { id: "t1", value: 64 },
        { id: "t2", value: 30 },
        { id: "t3", value: 70 },
        { id: "t4", value: 80 },
    ];
    let root: HeapNode | null = null;
    for (const { id, value } of insertOrder) {
        const result = insertHeap(root, value, id, isMinHeap);
        root = result.root;
    }
    return root!;
};

const treeInitialMinHeapRoot = buildTreeInitialHeapRoot(true);
const treeInitialMaxHeapRoot = buildTreeInitialHeapRoot(false);

const fitViewOptions: FitViewOptions = {
    padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: false,
};

function Playground() {
    const searchParams = useSearchParams();
    const algoType = searchParams.get("type");
    const algorithm = searchParams.get("algorithm") || "";

    // Set initial nodes and edges based on algorithm type
    const isTree = algoType === "tree";
    const isGraph = algoType === "graph";

    const getInitialNodes = () => {
        if (isTree) return treeInitialNodes;
        if (isGraph) return graphInitialNodes;
        return initialNodes;
    };

    const getInitialEdges = () => {
        if (isTree) return treeInitialEdges;
        if (isGraph) return graphInitialEdges;
        return initialEdges;
    };

    const [nodes, setNodes] = useState<Node[]>(getInitialNodes());
    const [edges, setEdges] = useState<Edge[]>(getInitialEdges());
    const { flowToScreenPosition } = useReactFlow();
    const rebalanceRef = useRef<(() => void) | null>(null);
    const btRebalanceRef = useRef<(() => void) | null>(null);
    const heapRebalanceRef = useRef<(() => void) | null>(null);
    const trashDeleteRef = useRef<((nodeId: string, value: number) => void) | null>(null);

    // Tutorial logic extracted to custom hook
    const tutorial = useTreeTutorial({
        nodes,
        flowToScreenPosition,
        setNodes,
        setEdges,
        isTree,
    });
    const [showInfo, setShowInfo] = useState(false);

    // Graph Tutorial hook
    const graphTutorial = useGraphTutorial({
        nodes,
        edges,
        flowToScreenPosition,
        setNodes,
        setEdges,
        isGraph,
    });

    // Node interaction (universal - works for all node types, only active when NOT in tutorial)
    const nodeInteraction = useNodeInteraction({
        nodes,
        edges,
        setNodes,
        setEdges,
        isTree,
        isGraph,
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

    const autoInsertRef = useRef<((value: number) => void) | null>(null);

    const onConnect: OnConnect = useCallback(
        (connection) => {
            // Intercept connections for algorithms to validate
            const isStrictBST = ['binary-search-tree', 'avl-tree'].includes(algorithm);
            const isGenericBT = ['binary-tree-inorder', 'binary-tree-preorder', 'binary-tree-postorder'].includes(algorithm);

            if (isGenericBT && connection.source && connection.target) {
                // Check how many children the parent already has
                const parentEdges = edges.filter(e => e.source === connection.source);
                if (parentEdges.length >= 2) {
                    console.warn("Parent already has 2 children. Auto-correcting placement...");

                    // Reject the edge! Find the target node value
                    const targetNode = nodes.find(n => n.id === connection.target);
                    const val = targetNode ? Number(targetNode.data.label) : NaN;

                    if (!isNaN(val)) {
                        // Delete the manually placed floating node since the connection is invalid
                        setNodes(nds => nds.filter(n => n.id !== connection.target));

                        // Auto-correct by properly inserting the value (which will find the next level-order gap)
                        if (autoInsertRef.current) {
                            setTimeout(() => autoInsertRef.current?.(val), 100);
                        }
                    }
                    return; // abort connection
                }
            }

            setEdges((eds) => addEdge(connection, eds));
            // If in tutorial step 3 (connect), advance to next step
            if (tutorial.showTutorial && tutorial.tutorialStep === 2) {
                tutorial.setTutorialStep(3);
            }
        },
        [setEdges, setNodes, edges, nodes, algorithm, tutorial],
    );

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Edge click handler (for weight editing)
    const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        if (graphTutorial.showTutorial && isGraph) {
            graphTutorial.handleWeightClick(edge.id);
        } else {
            nodeInteraction.handleEdgeClick(event, edge.id);
        }
    }, [graphTutorial, isGraph, nodeInteraction]);

    // Combined node click handler
    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (tutorial.showTutorial && isTree) {
            tutorial.handleNodeClick(event, node);
        } else if (graphTutorial.showTutorial && isGraph) {
            graphTutorial.handleNodeClick(event, node);
        } else {
            nodeInteraction.handleNodeClick(event, node);
        }
    }, [tutorial, graphTutorial, nodeInteraction, isTree, isGraph]);

    // Combined node drag handlers
    const handleNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
        if (tutorial.showTutorial || graphTutorial.showTutorial) return;
        nodeInteraction.handleNodeDragStart(event, node);
    }, [tutorial.showTutorial, graphTutorial.showTutorial, nodeInteraction]);

    const handleNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
        if (tutorial.showTutorial && isTree) {
            tutorial.onNodeDrag(event, node);
        } else if (graphTutorial.showTutorial && isGraph) {
            graphTutorial.onNodeDrag(event, node);
        } else {
            nodeInteraction.handleNodeDrag(event, node);
        }
    }, [tutorial, graphTutorial, nodeInteraction, isTree, isGraph]);

    const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        if (tutorial.showTutorial && isTree) {
            tutorial.onNodeDragStop(event, node);
        } else if (graphTutorial.showTutorial && isGraph) {
            graphTutorial.onNodeDragStop(event, node);
        } else {
            nodeInteraction.handleNodeDragStop(event, node);
        }
    }, [tutorial, graphTutorial, nodeInteraction, isTree, isGraph]);

    // Pane click to clear selection (universal)
    const handlePaneClick = useCallback(() => {
        if (!(tutorial.showTutorial || graphTutorial.showTutorial)) {
            nodeInteraction.handlePaneClick();
        }
    }, [tutorial.showTutorial, graphTutorial.showTutorial, nodeInteraction]);

    {/*Check Type & Display Data Input of Current Algorithms */ }
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
                        currentEdges={edges}
                        algorithm={algorithm}
                        onRebalanceReady={(fn) => { rebalanceRef.current = fn; }}
                        onBTRebalanceReady={(fn) => { btRebalanceRef.current = fn; }}
                        onHeapRebalanceReady={(fn) => { heapRebalanceRef.current = fn; }}
                        initialBSTRoot={["binary-search-tree", "avl-tree"].includes(algorithm) ? treeInitialBSTRoot : null}
                        initialBTRoot={['binary-tree-inorder', 'binary-tree-preorder', 'binary-tree-postorder'].includes(algorithm) ? treeInitialBTRoot : null}
                        initialHeapRoot={algorithm === 'min-heap' ? treeInitialMinHeapRoot : algorithm === 'max-heap' ? treeInitialMaxHeapRoot : null}
                        initialAVLRoot={algorithm === 'avl-tree' ? treeInitialAVLRoot : null}
                        onTrashDeleteReady={(fn) => { trashDeleteRef.current = fn; }}
                        onAutoInsertReady={(fn) => { autoInsertRef.current = fn; }}
                    />
                );
            case 'graph':
                return <Data_graph />;
            default:
                return (
                    <Data_sort
                        nodeInput={0}
                        setNodeInput={function (): void {
                            throw new Error("Function not implemented.");
                        }}
                    />
                );
        }
    };

    {/*Check Type & Display Title of Current Algorithms */ }
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
                onNodeDragStart={handleNodeDragStart}
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
                <div>
                    <CodeAlgo tutorialMode={tutorial.showTutorial || graphTutorial.showTutorial} />
                    <ExplainAlgo tutorialMode={tutorial.showTutorial || graphTutorial.showTutorial} />
                    {renderDataVisualizer()}
                </div>
                <div>
                    <PostTest_portal />
                </div>
            </SideTab>

            {/*Top Left Component show Info for reading how algo work & Status of Node in Playground Page */}
            <div className="absolute top-4 left-8 z-10 flex gap-2">
                <GoToHome_Portal />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(true)
                    }}
                    className="rounded-full bg-white p-2 border border-gray-200 shadow-lg hover:shadow-lg hover:bg-gray-100 transition cursor-pointer">
                    <Info color='#000000' />
                </button>
                <StatusNode />
            </div>

            {/* Info Reading inside Playground */}
            <Reading_modal
                isOpen={showInfo}
                onClose={() => setShowInfo(false)} />


            {/* STutorial Complelte Modal Show When User Finish Tutorial */}
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

            {/* Universal trash bin (non-tutorial mode) */}
            {!(tutorial.showTutorial || graphTutorial.showTutorial) && (
                <TreeTrashBin
                    show={nodeInteraction.showTrashBin}
                    isActive={nodeInteraction.isTrashActive}
                    position={nodeInteraction.trashBinPos}
                />
            )}

            {/* Weight Modal (non-tutorial mode, graph) */}
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

            {/* Completion modal for tree */}
            {tutorial.showCompletionModal && (
                <Tutorial_modal
                    showModal={tutorial.showCompletionModal}
                    onClose={() => tutorial.setShowCompletionModal(false)}
                    tutorialContent={[{
                        title: "Tutorial Complete!",
                        description: "You are now ready to explore Binary Search Tree."
                    }]}
                    onLetsPlay={
                        algorithm === "avl-tree"
                            ? () => rebalanceRef.current?.()
                            : ['binary-tree-inorder', 'binary-tree-preorder', 'binary-tree-postorder'].includes(algorithm)
                                ? () => btRebalanceRef.current?.()
                                : ['min-heap', 'max-heap'].includes(algorithm)
                                    ? () => heapRebalanceRef.current?.()
                                    : undefined
                    }
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