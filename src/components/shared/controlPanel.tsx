"use client";
import React from "react";
import {
  ChevronFirst,
  ChevronLast,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
} from "lucide-react";
import { AlgoController } from "@/types/AlgoController";

type ControlPanelProps = {
  // เติม ? เพื่อบอกว่าหน้านี้อาจจะไม่ได้ส่ง controller มาก็ได้ (เช่น หน้า Tree, Graph)
  controller?: AlgoController;
};

function ControlPanel({ controller }: ControlPanelProps) {
  // กำหนดค่า Default เผื่อกรณีที่ไม่มี controller ส่งมา
  const isRunning = controller?.isRunning || false;
  const currentSpeed = controller?.speed || "1x";

  return (
    <div className="flex justify-center">
      <div className="w-152.5 h-27.5 rounded-lg shadow-lg border border-gray-300 bg-white flex flex-col px-4 items-center justify-center">
        {/* Play, Pause & Speed Line */}
        <div className="flex flex-row gap-2 items-center mb-2">
          <div className="flex gap-2 items-center">
            <p className="font-semibold text-sm">Auto Execution</p>
            <button
              type="button"
              className={`w-28.25 h-10 p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center transition-colors ${isRunning ? "bg-[#0066CC] text-white" : "hover:bg-gray-200"}`}
              onClick={controller?.run}
              disabled={!controller} // ปิดปุ่มถ้าไม่มี controller
            >
              <Play fill={isRunning ? "white" : "black"} />
              Run
            </button>
            <button
              type="button"
              className={`w-28.25 h-10 p-2 gap-2 border border-gray-300 rounded-lg flex items-center justify-center transition-colors ${!isRunning && controller ? "bg-[#0066CC] text-white" : "hover:bg-gray-200"}`}
              onClick={controller?.stop}
              disabled={!controller}
            >
              <Pause fill={!isRunning && controller ? "white" : "black"} />
              Stop
            </button>
          </div>

          {/* Speed Limit for Algo */}
          <div className="flex gap-2 items-center">
            <p className="font-semibold text-sm">Speed</p>
            {["1x", "2x", "5x"].map((speedVal) => (
              <button
                key={speedVal}
                type="button"
                className={`w-auto h-10 p-2 border border-gray-300 rounded-lg transition-colors ${currentSpeed === speedVal ? "bg-[#0066CC] text-white" : "hover:bg-gray-200"}`}
                onClick={() =>
                  controller?.setSpeed?.(speedVal as "1x" | "2x" | "5x")
                }
                disabled={!controller}
              >
                {speedVal}
              </button>
            ))}
          </div>
        </div>

        {/* Button for show algo step by step line */}
        <div className="flex flex-row gap-2">
          <button
            onClick={controller?.prevStep}
            disabled={!controller}
            type="button"
            className="w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200"
          >
            <ChevronFirst />
            Prev Step
          </button>
          <button
            onClick={controller?.nextStep}
            disabled={!controller}
            type="button"
            className="w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200"
          >
            Next Step
            <ChevronLast />
          </button>
          <button
            onClick={controller?.skipBack}
            disabled={!controller}
            type="button"
            className="w-30 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200"
          >
            <ChevronsLeft />
            Skip Back
          </button>
          <button
            onClick={controller?.skipForward}
            disabled={!controller}
            type="button"
            className="w-35.5 h-10 p-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200"
          >
            Skip Forward
            <ChevronsRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
