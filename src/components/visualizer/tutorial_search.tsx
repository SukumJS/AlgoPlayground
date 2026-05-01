"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface TutorialProps {
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

export default function TutorialSearch({
  currentStep,
  node2ScreenPos,
  node3ScreenPos,
  node1ScreenPos,
  sidebarNodePos,
  dropZoneScreenPos,
  isTrashActive,
  trashBinPos,
  onComplete, // อย่าลืมใส่เข้ามาใน props destruction
  nodeMaskSize,
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

  // กันข้ามอัตโนมัติ
  if (localEndStep === 0) {
    if (currentStep >= 5) {
      setLocalEndStep(1);
    }
  }

  // หากอยู่ในช่วง 2 สเต็ปสุดท้าย ให้รันหน้าตานี้
  if (localEndStep > 0) {
    return (
      <div className="fixed inset-0 z-[80] pointer-events-auto transition-opacity duration-300">
        {/* --- MASK SPOTLIGHT สำหรับ Legend และ Post Test --- */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ position: "fixed" }}
        >
          <defs>
            <mask id="endstep-spotlight-mask-search">
              <rect width="100%" height="100%" fill="white" />
              {localEndStep === 1 && (
                <rect
                  x="180"
                  y="12"
                  width="330"
                  height="45"
                  rx="22"
                  fill="black"
                />
              )}
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
            mask="url(#endstep-spotlight-mask-search)"
          />
        </svg>

        {/* กล่องชี้สถานะสี (ซ้ายบน) */}
        {localEndStep === 1 && (
          <div className="absolute top-[120px] left-[200px] bg-white p-6 rounded-xl shadow-2xl w-[280px] transition-all duration-500 ease-in-out">
            <DashedArrow
              width={50}
              className="absolute -top-[45px] left-[130px] transform rotate-90"
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

  if (currentStep >= 5) return null;

  const nodeBoxSize = 105;
  const nodeHalfBox = nodeBoxSize / 2;
  const nodeRadius = "12";
  const sidebarBoxSize = 54;
  const sidebarHalfBox = sidebarBoxSize / 2;

  return (
    <>
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-[60]"
        style={{ position: "fixed" }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />

            {/* Step 0 */}
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

            {/* Step 1 & 2 */}
            {(currentStep === 1 || currentStep === 2) && node2ScreenPos && (
              <rect
                x={node2ScreenPos.x - nodeHalfBox}
                y={node2ScreenPos.y - nodeHalfBox}
                width={nodeBoxSize}
                height={nodeBoxSize}
                rx={nodeRadius}
                fill="black"
              />
            )}
            {(currentStep === 1 || currentStep === 2) && node3ScreenPos && (
              <rect
                x={node3ScreenPos.x - nodeHalfBox}
                y={node3ScreenPos.y - nodeHalfBox}
                width={nodeBoxSize}
                height={nodeBoxSize}
                rx={nodeRadius}
                fill="black"
              />
            )}

            {/* Step 3 & 4 */}
            {(currentStep === 3 || currentStep === 4) && node1ScreenPos && (
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
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* UI Tooltips */}
      {currentStep === 0 && (
        <div
          className="fixed z-[70] bg-white rounded-xl shadow-xl px-5 py-4 border border-gray-200 flex items-center justify-center text-center w-[220px]"
          style={{
            top: sidebarNodePos ? `${sidebarNodePos.y - 45}px` : "30%",
            right: sidebarNodePos
              ? `calc(100vw - ${sidebarNodePos.x}px + 65px)`
              : "350px",
          }}
        >
          <p className="text-sm text-gray-800">
            <span className="font-bold">Drag an element</span> from the panel
            and drop it here.
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

      {currentStep === 1 && node2ScreenPos && (
        <div
          className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${node2ScreenPos.x}px`,
            bottom: `calc(100vh - ${node2ScreenPos.y}px + ${nodeHalfBox + 15}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
            Press &apos;2&apos; and drag it to swap
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

      {currentStep === 2 && node3ScreenPos && node2ScreenPos && (
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

      {(currentStep === 3 || currentStep === 4) && node1ScreenPos && (
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

      {currentStep === 3 && node1ScreenPos && (
        <div
          className="fixed z-[70] bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200"
          style={{
            left: `${node1ScreenPos.x}px`,
            bottom: `calc(100vh - ${node1ScreenPos.y}px + ${nodeHalfBox + 15}px)`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm text-gray-800 font-bold whitespace-nowrap">
            Press and hold element &apos;1&apos;.
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

      {currentStep === 4 && (
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
              Drag it to the trash bin.
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
