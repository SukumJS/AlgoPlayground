"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";

// for reuse to children component
interface RandomSizeProps {
  inputValue?: string;
  onReset?: () => void;
  onAdd?: (value: number) => void;
  isDisabled?: boolean; //  เพิ่ม Prop นี้เข้ามาเพื่อรับสถานะ "เต็ม/ล็อก"
  warningText?: string | null;
}

const RandomSize = ({
  onReset,
  onAdd,
  isDisabled,
  warningText,
}: RandomSizeProps) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleRandomClick = () => {
    if (isDisabled) return; // กันไว้เผื่อหลุด
    const randomNum = Math.floor(Math.random() * 30) + 1;
    setInputValue(randomNum.toString());
  };

  const handleAdd = () => {
    if (isDisabled) return; // กันไม่ให้กดเพิ่มถ้าถูกล็อก
    if (onAdd && inputValue) {
      onAdd(parseInt(inputValue));
      setInputValue("");
    }
  };

  const handleReset = () => {
    setInputValue("");
    if (onReset) {
      onReset();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 text-start m-1 w-full">
        <p className="font-bold text-md">Random Size</p>
        <div className="flex gap-2 w-full">
          <input
            type="number"
            placeholder={isDisabled ? "Limit reached" : "Max 50"}
            disabled={isDisabled}
            className={`p-2 rounded-lg flex-1 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all ${
              isDisabled
                ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed"
                : "border border-gray-200 placeholder:text-gray-300"
            }`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            disabled={isDisabled}
            className={`rounded-lg p-2 shrink-0 transition-all ${
              isDisabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#222121] hover:bg-black cursor-pointer"
            }`}
            onClick={handleAdd}
          >
            <Plus color="white" />
          </button>
        </div>
        {warningText && (
          <div className="text-red-500 text-sm font-medium text-left w-full my-1 transition-opacity duration-300">
            {warningText}
          </div>
        )}

        {/* ปุ่ม Reset All*/}
        <button
          className="w-full bg-[#222121] text-white text-center p-2 rounded-lg mt-1 hover:bg-black transition-colors"
          onClick={handleReset}
        >
          Reset All
        </button>
      </div>
    </>
  );
};

export default RandomSize;
