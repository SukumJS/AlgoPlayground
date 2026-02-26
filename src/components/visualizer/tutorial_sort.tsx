'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface TutorialProps {
    onComplete: () => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    droppedNodeScreenPos?: { x: number; y: number } | null;
    node34ScreenPos?: { x: number; y: number } | null;
    node64ScreenPos?: { x: number; y: number } | null;
    node3ScreenPos?: { x: number; y: number } | null;
    sidebarNodePos?: { x: number; y: number } | null;
    dropZoneScreenPos?: { x: number; y: number } | null;
    isTrashActive?: boolean;
    trashBinPos?: { x: number; y: number } | null;
}

const DashedArrow = ({ className, style, width = 50, color = "#333" }: { className?: string, style?: React.CSSProperties, width?: number, color?: string }) => (
    <svg width={width} height="24" viewBox={`0 0 ${width} 24`} fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
        <path d={`M${width - 2} 12H5`} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
        <path d="M12 19L5 12L12 5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function TutorialSort({ 
    currentStep, 
    node34ScreenPos, 
    node64ScreenPos, 
    node3ScreenPos, 
    sidebarNodePos, 
    dropZoneScreenPos,
    isTrashActive, 
    trashBinPos 
}: TutorialProps) {

    if (currentStep >= 5) return null;

    // 🌟 บีบขนาดกรอบเจาะรูให้ฟิตพอดีเป๊ะกับกล่อง Node ของคุณ (ประมาณ 62px)
    const nodeBoxSize = 62; 
    const nodeHalfBox = nodeBoxSize / 2;
    const nodeRadius = "10"; 

    // ของ Sidebar จะเล็กกว่านิดนึง
    const sidebarBoxSize = 58;
    const sidebarHalfBox = sidebarBoxSize / 2;

    return (
        <>
            {/* 🌑 SVG Overlay for Spotlight Effect */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-[60]" style={{ position: 'fixed' }}>
                <defs>
                    <mask id="spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />

                        {/* Step 0: ส่องกรอบที่ Sidebar */}
                        {currentStep === 0 && sidebarNodePos && (
                            <rect x={sidebarNodePos.x - sidebarHalfBox} y={sidebarNodePos.y - sidebarHalfBox} width={sidebarBoxSize} height={sidebarBoxSize} rx="8" fill="black" />
                        )}

                        {/* Step 1 & 2: ส่องกรอบไปที่ 34 และ 64 (ฟิตพอดีกล่อง) */}
                        {(currentStep === 1 || currentStep === 2) && node34ScreenPos && (
                            <rect x={node34ScreenPos.x - nodeHalfBox} y={node34ScreenPos.y - nodeHalfBox} width={nodeBoxSize} height={nodeBoxSize} rx={nodeRadius} fill="black" />
                        )}
                        {(currentStep === 1 || currentStep === 2) && node64ScreenPos && (
                            <rect x={node64ScreenPos.x - nodeHalfBox} y={node64ScreenPos.y - nodeHalfBox} width={nodeBoxSize} height={nodeBoxSize} rx={nodeRadius} fill="black" />
                        )}

                        {/* Step 3 & 4: ส่องกรอบไปที่เลข 3 */}
                        {(currentStep === 3 || currentStep === 4) && node3ScreenPos && (
                            <rect x={node3ScreenPos.x - nodeHalfBox} y={node3ScreenPos.y - nodeHalfBox} width={nodeBoxSize} height={nodeBoxSize} rx={nodeRadius} fill="black" />
                        )}
                    </mask>
                </defs>
                {/* 🌟 ปรับความทึบแสงให้เข้มขึ้นนิดนึง กล่องที่ถูกส่องจะได้ดูสว่างพุ่งออกมา */}
                <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.55)" mask="url(#spotlight-mask)" />
            </svg>


            {/* 💬 Step 0: Drag from Sidebar */}
            {currentStep === 0 && (
                <div
                    className="fixed z-[70] bg-white rounded-xl shadow-xl px-5 py-4 border border-gray-200 flex items-center justify-center text-center w-[220px]"
                    style={{
                        top: sidebarNodePos ? `${sidebarNodePos.y - 40}px` : '30%',
                        right: sidebarNodePos ? `calc(100vw - ${sidebarNodePos.x}px + 60px)` : '350px',
                    }}
                >
                    <p className="text-sm text-gray-800">
                        <span className="font-bold">Drag a element</span> from the panel and drop it where the playground glows.
                    </p>
                    <DashedArrow width={45} className="absolute pointer-events-none" style={{ left: '100%', top: '50%', marginTop: '-12px', marginLeft: '5px', transform: 'rotate(180deg)' }} />
                </div>
            )}

            {/* ✨ Step 0: กล่องเส้นประ Glow Zone (บีบขนาดให้พอดีกับกล่อง Node) */}
            {currentStep === 0 && dropZoneScreenPos && (
                <div
                    className="fixed z-[55] pointer-events-none flex items-center justify-center"
                    style={{
                        left: `${dropZoneScreenPos.x}px`,
                        top: `${dropZoneScreenPos.y}px`,
                        transform: 'translate(-50%, -50%)',
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '10px',
                        border: '3px solid rgba(255,255,255,0.7)',
                        boxShadow: '0 0 15px rgba(255,255,255,0.8) inset, 0 0 20px rgba(255,255,255,0.5)',
                        background: 'rgba(255,255,255,0.2)'
                    }}
                />
            )}

            {/* 💬 Step 1: Drag 34 right */}
            {currentStep === 1 && node34ScreenPos && (
                <div
                    className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
                    style={{ left: `${node34ScreenPos.x}px`, bottom: `calc(100vh - ${node34ScreenPos.y}px + 45px)`, transform: 'translateX(-50%)' }}
                >
                    <p className="text-sm text-gray-800 font-bold whitespace-nowrap">Press '34' and drag it to the right ➡️</p>
                    <DashedArrow width={30} className="absolute pointer-events-none" style={{ left: '50%', top: '100%', marginLeft: '-15px', marginTop: '2px', transform: 'rotate(-90deg)' }} />
                </div>
            )}

            {/* 💬 Step 2: Swap Complete */}
            {currentStep === 2 && node64ScreenPos && node34ScreenPos && (
                <div
                    className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
                    style={{ left: `${(node64ScreenPos.x + node34ScreenPos.x) / 2}px`, bottom: `calc(100vh - ${node64ScreenPos.y}px + 45px)`, transform: 'translateX(-50%)' }}
                >
                    <p className="text-sm text-gray-800 font-bold whitespace-nowrap">Swap Complete!</p>
                    <DashedArrow width={30} className="absolute pointer-events-none" style={{ left: '50%', top: '100%', marginLeft: '-15px', marginTop: '2px', transform: 'rotate(-90deg)' }} />
                </div>
            )}

            {/* 🔵 กล่องสีฟ้าครอบทับเลข 3 สำหรับ Step 3 & 4 (ฟิตพอดีกรอบเจาะรู) */}
            {(currentStep === 3 || currentStep === 4) && node3ScreenPos && (
                <div
                    className="fixed z-[55] pointer-events-none"
                    style={{
                        left: `${node3ScreenPos.x}px`, top: `${node3ScreenPos.y}px`, transform: 'translate(-50%, -50%)',
                        width: '66px', height: '66px', borderRadius: '10px', 
                        border: '3px solid #2196F3', 
                        boxShadow: '0 0 10px rgba(33, 150, 243, 0.5)',
                    }}
                />
            )}

            {/* 💬 Step 3: Press and hold */}
            {currentStep === 3 && node3ScreenPos && (
                <div
                    className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
                    style={{ left: `${node3ScreenPos.x}px`, bottom: `calc(100vh - ${node3ScreenPos.y}px + 45px)`, transform: 'translateX(-50%)' }}
                >
                    <p className="text-sm text-gray-800 font-bold whitespace-nowrap">Press and hold the element.</p>
                    <DashedArrow width={30} className="absolute pointer-events-none" style={{ left: '50%', top: '100%', marginLeft: '-15px', marginTop: '2px', transform: 'rotate(-90deg)' }} />
                </div>
            )}

            {/* 🗑️ Step 4: Trash Bin */}
            {currentStep === 4 && (
                <>
                    <div
                        className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
                        style={{ left: trashBinPos ? `${trashBinPos.x - 210}px` : '40%', top: trashBinPos ? `${trashBinPos.y}px` : '85%', transform: 'translateY(-50%)' }}
                    >
                        <p className="text-sm text-gray-800 font-bold whitespace-nowrap">Drag it to the trash bin icon.</p>
                        <DashedArrow width={40} className="absolute pointer-events-none" style={{ left: '100%', top: '50%', marginTop: '-12px', marginLeft: '5px', transform: 'rotate(180deg)' }} />
                    </div>
                    <div
                        className={`trash-bin fixed z-[65] flex items-center justify-center w-16 h-16 rounded-full bg-[#E53E3E] shadow-lg border-2 border-[#5D5D5D] transition-transform duration-200 ${isTrashActive ? 'scale-125' : ''}`}
                        style={{
                            bottom: '140px', left: '50%', transform: 'translateX(-50%)',
                            boxShadow: isTrashActive ? '0 0 30px 10px rgba(229, 62, 62, 0.8)' : '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        <Trash2 color="white" size={32} />
                    </div>
                </>
            )}
        </>
    );
}