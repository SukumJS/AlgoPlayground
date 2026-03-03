"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";

// for reuse to children component
interface RandomSizeProps {
  inputValue?: string;
  onReset?: () => void;
  onAdd?: (value: number) => void;
}

const RandomSize = ({ onReset, onAdd }: RandomSizeProps) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleRandomClick = () => {
    const randomNum = Math.floor(Math.random() * 30) + 1;
    setInputValue(randomNum.toString());
  };

  const handleAdd = () => {
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
      <div className="grid-cols-1 grid gap-2 text-start m-1">
        <p className="font-bold text-md">Random Size</p>
        <div className="flex gap-2">
          <input
            type="number"
            className="border border-gray-200 p-2 rounded-lg w-80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="bg-[#222121] rounded-lg p-2" onClick={handleAdd}>
            <Plus color="white" />
          </button>
        </div>
        <button
          className="bg-[#222121] text-white text-center p-2 rounded-lg mt-2"
          onClick={handleReset}
        >
          Reset All
        </button>
      </div>
    </>
  );
};

export default RandomSize;
