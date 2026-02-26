import { useState, useCallback, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import type { SortNodeData } from "@/src/components/shared/sortNode"; 

interface ScreenPosition {
    x: number;
    y: number;
}

interface UseSortTutorialProps {
    nodes: Node<SortNodeData>[];
    flowToScreenPosition: (position: { x: number; y: number }) => { x: number; y: number };
    setNodes: React.Dispatch<React.SetStateAction<Node<SortNodeData>[]>>;
    isSort: boolean;
}

export function useSortTutorial({
    nodes,
    flowToScreenPosition,
    setNodes,
    isSort,
}: UseSortTutorialProps) {
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const [droppedNodeScreenPos, setDroppedNodeScreenPos] = useState<ScreenPosition | null>(null);
    const [node34ScreenPos, setNode34ScreenPos] = useState<ScreenPosition | null>(null);
    const [node64ScreenPos, setNode64ScreenPos] = useState<ScreenPosition | null>(null);
    const [node3ScreenPos, setNode3ScreenPos] = useState<ScreenPosition | null>(null);
    const [sidebarNodePos, setSidebarNodePos] = useState<ScreenPosition | null>(null);
    const [trashBinPos, setTrashBinPos] = useState<ScreenPosition | null>(null);
    const [isTrashActive, setIsTrashActive] = useState(false);
    const [dropZoneScreenPos, setDropZoneScreenPos] = useState<ScreenPosition | null>(null);

    const updateTutorialPositions = useCallback(() => {
        if (!showTutorial) return;

        // 🌟 ปรับ offset ให้ดึงจุดกึ่งกลางได้แม่นยำขึ้นสำหรับกล่องขนาด 62-64px
        const offset = 32;

        const node34 = nodes.find(n => String(n.data.value) === '34');
        if (node34) setNode34ScreenPos(flowToScreenPosition({ x: node34.position.x + offset, y: node34.position.y + offset })); 

        const node64 = nodes.find(n => String(n.data.value) === '64');
        if (node64) setNode64ScreenPos(flowToScreenPosition({ x: node64.position.x + offset, y: node64.position.y + offset }));

        const node3 = nodes.find(n => String(n.data.value) === '3');
        if (node3) setNode3ScreenPos(flowToScreenPosition({ x: node3.position.x + offset, y: node3.position.y + offset }));

        const node25 = nodes.find(n => String(n.data.value) === '25');
        if (node25) {
            setDropZoneScreenPos(flowToScreenPosition({ 
                x: node25.position.x + 65 + offset, 
                y: node25.position.y + offset 
            }));
        }

        const droppedNode = nodes.find(n => String(n.data.value) === '11');
        if (droppedNode) setDroppedNodeScreenPos(flowToScreenPosition({ x: droppedNode.position.x + offset, y: droppedNode.position.y + offset }));

        setTimeout(() => {
            const targetSidebarNode = document.querySelector('[data-tutorial-target="sidebar-sort-node"]');
            if (targetSidebarNode) {
                const rect = targetSidebarNode.getBoundingClientRect();
                setSidebarNodePos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
            }
        }, 100); 

        setTrashBinPos({
            x: window.innerWidth / 2,
            y: window.innerHeight - 140
        });

    }, [nodes, showTutorial, flowToScreenPosition]);

    useEffect(() => {
        updateTutorialPositions();
        window.addEventListener('resize', updateTutorialPositions);
        return () => window.removeEventListener('resize', updateTutorialPositions);
    }, [updateTutorialPositions]);

    useEffect(() => { if (isSort) setShowTutorial(true); }, [isSort]);

    useEffect(() => {
        if (showTutorial) {
            const timer = setTimeout(() => updateTutorialPositions(), 500);
            return () => clearTimeout(timer);
        }
    }, [showTutorial, updateTutorialPositions]);

    useEffect(() => {
        if (tutorialStep === 2) {
            const timer = setTimeout(() => {
                setTutorialStep(3);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [tutorialStep]);

    const handleTutorialComplete = useCallback(() => {
        setShowTutorial(false);
        setShowCompletionModal(true);
    }, []);

    const handleTutorialDropSuccess = useCallback(() => {
        if (showTutorial && tutorialStep === 0) {
            // 🌟 ลบการเปลี่ยน status เป็น "compare" ออกไป กล่องจะสีปกติ (เหลือง) สวยๆ แน่นอน
            setTutorialStep(1);
        }
    }, [showTutorial, tutorialStep]);

    const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node<SortNodeData>) => {
        if (showTutorial && tutorialStep === 3) {
            if (String(node.data.value) === '3') {
                // 🌟 ลบการเปลี่ยน status ออกเช่นกัน
                setTutorialStep(4);
            }
        }
    }, [showTutorial, tutorialStep]);

    const onNodeDrag = useCallback((event: React.MouseEvent, node: Node<SortNodeData>) => {
        if (showTutorial && tutorialStep === 4) {
            const trashX = window.innerWidth / 2;
            const trashY = window.innerHeight - 140;
            const dist = Math.sqrt(Math.pow(event.clientX - trashX, 2) + Math.pow(event.clientY - trashY, 2));
            setIsTrashActive(dist < 150);
        }
    }, [showTutorial, tutorialStep]);

    const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node<SortNodeData>) => {
        if (!showTutorial) return;

        if (tutorialStep === 1) {
            if (String(node.data.value) === '34') {
                setNodes(nds => {
                    const newNodes = [...nds];
                    const idx34 = newNodes.findIndex(n => String(n.data.value) === '34');
                    const idx64 = newNodes.findIndex(n => String(n.data.value) === '64');
                    
                    if (idx34 !== -1 && idx64 !== -1) {
                        const tempPos = { ...newNodes[idx34].position };
                        newNodes[idx34].position.x = newNodes[idx64].position.x;
                        newNodes[idx64].position.x = tempPos.x;
                        
                        const tempIdx = newNodes[idx34].data.index;
                        newNodes[idx34].data.index = newNodes[idx64].data.index;
                        newNodes[idx64].data.index = tempIdx;
                    }
                    return newNodes;
                });
                setTutorialStep(2); 
            }
        }

        if (tutorialStep === 4) {
            const trashX = window.innerWidth / 2;
            const trashY = window.innerHeight - 140;
            if (Math.sqrt(Math.pow(event.clientX - trashX, 2) + Math.pow(event.clientY - trashY, 2)) < 60) {
                setNodes(nds => nds.filter(n => n.id !== node.id));
                setIsTrashActive(false);
                handleTutorialComplete();
            }
        }
    }, [showTutorial, tutorialStep, setNodes, handleTutorialComplete]);

    return {
        showTutorial, tutorialStep, showCompletionModal, isTrashActive,
        droppedNodeScreenPos, node34ScreenPos, node64ScreenPos, node3ScreenPos, sidebarNodePos, trashBinPos, dropZoneScreenPos,
        setShowTutorial, setTutorialStep, setShowCompletionModal, handleTutorialComplete, handleTutorialDropSuccess,
        onNodeDragStart, onNodeDrag, onNodeDragStop,
    };
}