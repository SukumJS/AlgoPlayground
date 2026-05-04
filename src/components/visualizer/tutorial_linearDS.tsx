"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface TutorialProps {
  algorithm: string;
  onComplete: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  droppedNodeScreenPos?: { x: number; y: number } | null;
  node2ScreenPos?: { x: number; y: number } | null;
  node3ScreenPos?: { x: number; y: number } | null;
  node1ScreenPos?: { x: number; y: number } | null;
  sidebarNodePos?: { x: number; y: number } | null;
  dropZoneScreenPos?: { x: number; y: number } | null;
  isTrashActive?: boolean;
  trashBinPos?: { x: number; y: number } | null;
  nodeMaskSize?: number;
}

const DashedArrow = ({
  className,
  style,
  width = 50,
  color = "#333",
}: {
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  color?: string;
}) => (
  <svg
    width={width}
    height="24"
    viewBox={`0 0 ${width} 24`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d={`M${width - 2} 12H5`}
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="4 4"
    />
    <path
      d="M12 19L5 12L12 5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function TutorialLinearDS({
  algorithm,
  currentStep,
  setCurrentStep,
  node2ScreenPos,
  node3ScreenPos,
  node1ScreenPos,
  sidebarNodePos,
  dropZoneScreenPos,
  isTrashActive,
  trashBinPos,
  onComplete,
}: TutorialProps) {
  // สร้าง State ท้องถิ่นเพื่อตัดขาดจากระบบ Auto-Advance ของ Hook นอก
  const [localEndStep, setLocalEndStep] = useState(0);

  // ติดตามตำแหน่งปุ่ม Post Test แบบ dynamic
  const [postTestRect, setPostTestRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    if (localEndStep !== 2) return;
    // Force open the sidebar so the post test button becomes visible
    window.dispatchEvent(new CustomEvent("forceOpenSidebar"));
    let frameId: number;
    const track = () => {
      const el = document.getElementById("post-test-button");
      if (el) {
        const r = el.getBoundingClientRect();
        setPostTestRect({ x: r.left, y: r.top, w: r.width, h: r.height });
      }
      frameId = requestAnimationFrame(track);
    };
    track();
    return () => cancelAnimationFrame(frameId);
  }, [localEndStep]);
  // สร้าง State เก็บขนาดปุ่มและตามติดตำแหน่งปุ่มอัตโนมัติ
  const [sqRect, setSqRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const nodeBoxSize = 105;
  const nodeHalfBox = nodeBoxSize / 2;
  const nodeRadius = "12";
  const sidebarBoxSize = 54;
  const sidebarHalfBox = sidebarBoxSize / 2;

  const isStack = algorithm === "stack";
  const isQueue = algorithm === "queue";
  const isStackOrQueue = isStack || isQueue;
  const isLinkedList =
    algorithm === "singly-linked-list" || algorithm === "doubly-linked-list";
  const isArray = !isStackOrQueue && !isLinkedList;

  useEffect(() => {
    if (!isStackOrQueue) return;
    let frameId: number;
    const trackPosition = () => {
      // Step 0 จับกล่อง Insert, Step 1 จับกล่อง Delete
      const targetId =
        currentStep === 0 ? "tutorial-insert-zone" : "tutorial-delete-zone";
      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSqRect({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
      }
      frameId = requestAnimationFrame(trackPosition);
    };
    trackPosition();
    return () => cancelAnimationFrame(frameId);
  }, [isStackOrQueue, currentStep]);

  // กันข้ามอัตโนมัติ (Anti Auto-Skip System)
  if (localEndStep === 0) {
    if (isStackOrQueue && currentStep >= 2) {
      setLocalEndStep(1);
    } else if (isLinkedList && currentStep >= 2) {
      setLocalEndStep(1);
    } else if (isArray && currentStep >= 5) {
      setLocalEndStep(1);
    }
  }

  // หากอยู่ในช่วง 2 สเต็ปสุดท้าย ให้รันหน้าตานี้ และไม่ต้องสนใจ currentStep อีกต่อไป
  if (localEndStep > 0) {
    return (
      <div className="fixed inset-0 z-[80] pointer-events-auto transition-opacity duration-300">
        {/* --- MASK SPOTLIGHT สำหรับ Legend และ Post Test --- */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ position: "fixed" }}
        >
          <defs>
            <mask id="endstep-spotlight-mask">
              {/* เทพื้นสีขาว (ส่วนที่จะทึบแสง) */}
              <rect width="100%" height="100%" fill="white" />

              {/* เจาะรูไฮไลท์สำหรับ Color Legend (ซ้ายบน) */}
              {localEndStep === 1 && (
                <rect
                  x="180"
                  y="12"
                  width="250"
                  height="45"
                  rx="22" // ความโค้งมนของกรอบ
                  fill="black"
                />
              )}

              {/* เจาะรูไฮไลท์สำหรับ Post Test (ตามตำแหน่งจริง) */}
              {localEndStep === 2 && postTestRect && (
                <rect
                  x={postTestRect.x - 4}
                  y={postTestRect.y - 4}
                  width={postTestRect.w + 8}
                  height={postTestRect.h + 8}
                  rx="4"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#endstep-spotlight-mask)"
          />
        </svg>

        {/* กล่องชี้สถานะสี (ซ้ายบน) */}
        {localEndStep === 1 && (
          <div className="absolute top-[120px] left-[200px] bg-white p-6 rounded-xl shadow-2xl w-[280px] transition-all duration-500 ease-in-out">
            <DashedArrow
              width={50}
              className="absolute -top-[45px] left-[110px] transform rotate-90"
            />
            <h3 className="font-bold text-gray-800 text-lg mb-2">
              Color Legend
            </h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Look here to understand what different node colors mean
            </p>
            <button
              onClick={() => setLocalEndStep(2)}
              className="w-full py-2 bg-[#0066CC] hover:bg-[#0052a3] transition text-white rounded-lg font-bold"
            >
              Next
            </button>
          </div>
        )}

        {/* กล่องชี้ Post Test (ชี้ไปที่ปุ่ม Post Test จริง) */}
        {localEndStep === 2 && postTestRect && (
          <div
            className="fixed bg-white p-6 rounded-xl shadow-2xl w-[300px] transition-all duration-500 ease-in-out"
            style={{
              top: `${postTestRect.y - 280}px`,
              left: `${postTestRect.x + postTestRect.w / 2 - 150}px`,
            }}
          >
            <DashedArrow
              width={50}
              className="absolute -bottom-[50px] left-1/2 transform -translate-x-1/2 rotate-[270deg]"
            />
            <h3 className="font-bold text-gray-800 text-lg mb-2">Post Test</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Once you finish experimenting, click here to take a short quiz and
              test your knowledge!
            </p>
            <button
              onClick={onComplete}
              className="w-full py-2 bg-[#0066CC] hover:bg-[#0052a3] transition text-white rounded-lg font-bold"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 1. FLOW STACK และ QUEUE
  // ==========================================
  if (isStackOrQueue) {
    if (currentStep >= 2) return null; // Safety fallback
    return (
      <div className="fixed inset-0 z-[80] pointer-events-auto transition-opacity duration-300">
        {/* --- ไฟสปอร์ตไลท์เจาะรูเฉพาะตรงปุ่ม --- */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ position: "fixed" }}
        >
          <defs>
            <mask id="sq-spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {/* วาดกรอบสีดำตรงตำแหน่งปุ่มเพื่อเจาะทะลุความมืด */}
              {sqRect && (
                <rect
                  x={sqRect.x - 2}
                  y={sqRect.y - 2}
                  width={
                    sqRect.w + (currentStep === 0 ? (isQueue ? 140 : 120) : 5)
                  }
                  height={sqRect.h + (currentStep === 0 ? 5 : 5)}
                  rx="10"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          {/* พื้นหลังทึบแสง */}
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#sq-spotlight-mask)"
          />
        </svg>

        <div
          className={`absolute top-[72%] translate-y-6 ${
            currentStep === 0 ? "right-[90px]" : "right-[20px]"
          } bg-white p-6 rounded-xl shadow-2xl w-[260px] transition-all duration-500 ease-in-out`}
        >
          <DashedArrow
            width={50}
            className={`absolute -top-[35px] transform rotate-90 transition-all duration-500 ${
              currentStep === 0 ? "left-1/2 -ml-[25px]" : "right-[30px]"
            }`}
          />

          {currentStep === 0 && (
            <div className="">
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {isStack ? "Stack" : "Queue"} Tutorial
              </h3>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                Use the <b>Insert</b> input and click{" "}
                <b>{isStack ? "Push" : "Enqueue"}</b> to add an element.
              </p>
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full py-2 bg-[#0066CC] hover:bg-[#0052a3] transition text-white rounded-lg font-bold"
              >
                Next
              </button>
            </div>
          )}
          {currentStep === 1 && (
            <>
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {isStack ? "Stack" : "Queue"} Tutorial
              </h3>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                Click <b>{isStack ? "Pop" : "Dequeue"}</b> to remove the element
                safely.
              </p>
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-2 bg-[#0066CC] hover:bg-[#0052a3] transition text-white rounded-lg font-bold"
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 2. FLOW สำหรับ LINKED LIST
  if (isLinkedList) {
    if (currentStep === 0) {
      // ปล่อยผ่านไปให้ Render กล่อง Drag ด้านล่าง
    } else if (currentStep === 1) {
      return (
        <div className="fixed inset-0 z-[80] pointer-events-auto bg-black/60 transition-opacity duration-300">
          <div className="absolute top-[10%] left-[1320px] transform -translate-x-1/2 bg-white p-6 rounded-xl shadow-2xl w-[320px] text-center relative">
            <DashedArrow
              width={60}
              className="absolute -bottom-[50px] left-1/2 -ml-[30px] transform rotate-[270deg]"
            />

            <h3 className="font-bold text-gray-800 text-xl mb-3">
              Pointers Updated!
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              When you drop a node, notice how the{" "}
              <b>connecting arrows (pointers)</b> automatically update to
              maintain the data sequence.
            </p>
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-2.5 bg-[#0066CC] hover:bg-[#0052a3] transition text-white rounded-lg font-bold text-lg"
            >
              Next
            </button>
          </div>
        </div>
      );
    }
  }

  // FLOW สำหรับ ARRAY + Step 0 Linked List
  if (currentStep >= 5) return null;

  return (
    <>
      {/* --- MASK SPOTLIGHT --- */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-[60]"
        style={{ position: "fixed" }}
      >
        <defs>
          <mask id="spotlight-mask-linear">
            <rect width="100%" height="100%" fill="white" />
            {currentStep === 0 && sidebarNodePos && (
              <rect
                x={sidebarNodePos.x - sidebarHalfBox}
                y={sidebarNodePos.y - sidebarHalfBox}
                width={sidebarBoxSize}
                height={sidebarBoxSize}
                rx="8"
                fill="black"
              />
            )}
            {currentStep === 0 && dropZoneScreenPos && (
              <rect
                x={dropZoneScreenPos.x - nodeHalfBox}
                y={dropZoneScreenPos.y - nodeHalfBox}
                width={nodeBoxSize}
                height={nodeBoxSize}
                rx={nodeRadius}
                fill="black"
              />
            )}
            {isArray &&
              (currentStep === 1 || currentStep === 2) &&
              node2ScreenPos && (
                <rect
                  x={node2ScreenPos.x - nodeHalfBox}
                  y={node2ScreenPos.y - nodeHalfBox}
                  width={nodeBoxSize}
                  height={nodeBoxSize}
                  rx={nodeRadius}
                  fill="black"
                />
              )}
            {isArray &&
              (currentStep === 1 || currentStep === 2) &&
              node3ScreenPos && (
                <rect
                  x={node3ScreenPos.x - nodeHalfBox}
                  y={node3ScreenPos.y - nodeHalfBox}
                  width={nodeBoxSize}
                  height={nodeBoxSize}
                  rx={nodeRadius}
                  fill="black"
                />
              )}
            {isArray &&
              (currentStep === 3 || currentStep === 4) &&
              node1ScreenPos && (
                <rect
                  x={node1ScreenPos.x - nodeHalfBox}
                  y={node1ScreenPos.y - nodeHalfBox}
                  width={nodeBoxSize}
                  height={nodeBoxSize}
                  rx={nodeRadius}
                  fill="black"
                />
              )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.55)"
          mask="url(#spotlight-mask-linear)"
        />
      </svg>

      {/* --- STEP 0: Drag an Element (Array & Linked List) --- */}
      {currentStep === 0 && (
        <div
          className="fixed z-[70] bg-white rounded-xl shadow-xl px-5 py-4 border border-gray-200 flex items-center justify-center text-center w-[220px]"
          style={{
            top: sidebarNodePos ? `${sidebarNodePos.y - 45}px` : "30%",
            right: sidebarNodePos
              ? `calc(100vw - ${sidebarNodePos.x}px + 85px)`
              : "350px",
          }}
        >
          <p className="text-sm text-gray-800">
            <span className="font-bold">Drag an element</span> from the panel
            and drop it.
          </p>
          <DashedArrow
            width={45}
            className="absolute pointer-events-none"
            style={{
              left: "100%",
              top: "50%",
              marginTop: "-12px",
              marginLeft: "5px",
              transform: "rotate(180deg)",
            }}
          />
        </div>
      )}

      {currentStep === 0 && dropZoneScreenPos && (
        <div
          className="fixed z-[65] pointer-events-none"
          style={{
            left: `${dropZoneScreenPos.x}px`,
            top: `${dropZoneScreenPos.y}px`,
            transform: "translate(-50%, -50%)",
            width: `${nodeBoxSize}px`,
            height: `${nodeBoxSize}px`,
            borderRadius: "12px",
            border: "2px solid white",
          }}
        />
      )}

      {/* --- STEP 1: Array (Swap Instruction) --- */}
      {isArray && currentStep === 1 && node2ScreenPos && (
        <div
          className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${node2ScreenPos.x}px`,
            bottom: `calc(100vh - ${node2ScreenPos.y}px + ${nodeHalfBox + 15}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
            Press 2 and move it to the right
          </p>
          <DashedArrow
            width={30}
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "100%",
              marginLeft: "-15px",
              marginTop: "2px",
              transform: "rotate(-90deg)",
            }}
          />
        </div>
      )}

      {/* --- STEP 2: Array (Swap Complete) --- */}
      {isArray && currentStep === 2 && node3ScreenPos && node2ScreenPos && (
        <div
          className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${(node3ScreenPos.x + node2ScreenPos.x) / 2}px`,
            bottom: `calc(100vh - ${node3ScreenPos.y}px + ${nodeHalfBox + 15}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
            Swap Complete!
          </p>
          <DashedArrow
            width={30}
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "100%",
              marginLeft: "-15px",
              marginTop: "2px",
              transform: "rotate(-90deg)",
            }}
          />
        </div>
      )}

      {/* --- STEP 3: Array (Hold element to delete) --- */}
      {isArray &&
        (currentStep === 3 || currentStep === 4) &&
        node1ScreenPos && (
          <div
            className="fixed z-[65] pointer-events-none"
            style={{
              left: `${node1ScreenPos.x}px`,
              top: `${node1ScreenPos.y}px`,
              transform: "translate(-50%, -50%)",
              width: `${nodeBoxSize - 2}px`,
              height: `${nodeBoxSize - 2}px`,
              borderRadius: "12px",
            }}
          />
        )}
      {isArray && currentStep === 3 && node1ScreenPos && (
        <div
          className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${node1ScreenPos.x}px`,
            bottom: `calc(100vh - ${node1ScreenPos.y}px + ${nodeHalfBox + 15}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
            Press and hold the element.
          </p>
          <DashedArrow
            width={30}
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "100%",
              marginLeft: "-15px",
              marginTop: "2px",
              transform: "rotate(-90deg)",
            }}
          />
        </div>
      )}

      {/* --- STEP 4: Array (Drag to trash) --- */}
      {isArray && currentStep === 4 && (
        <>
          <div
            className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
            style={{
              left: trashBinPos ? `${trashBinPos.x - 310}px` : "40%",
              top: trashBinPos ? `${trashBinPos.y}px` : "85%",
              transform: "translateY(-110%)",
            }}
          >
            <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
              Drag it to the trash bin icon.
            </p>
            <DashedArrow
              width={40}
              className="absolute pointer-events-none"
              style={{
                left: "100%",
                top: "50%",
                marginTop: "-12px",
                marginLeft: "5px",
                transform: "rotate(180deg)",
              }}
            />
          </div>

          <div
            className={`trash-bin fixed z-[65] flex items-center justify-center w-16 h-16 rounded-full bg-[#E53E3E] shadow-lg border-2 border-[#5D5D5D] transition-transform duration-200 ${isTrashActive ? "scale-125" : ""}`}
            style={{
              bottom: "140px",
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: isTrashActive
                ? "0 0 30px 10px rgba(229, 62, 62, 0.8)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Trash2 color="white" size={32} />
          </div>
        </>
      )}
    </>
  );
}
