"use client";

import React from "react";

type FillBlankInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

function FillBlankInput({
  value,
  onChange,
  disabled = false,
  className = "",
}: FillBlankInputProps) {
  return (
    <div className={`w-full max-w-md ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="EX. 2"
        className={`
          w-full px-6 py-4 text-base text-[#222121]
          border-2 border-gray-300 rounded-2xl shadow-md
          bg-white placeholder-gray-400
          focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]
          transition-all duration-200
          ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : ""}
        `}
      />
    </div>
  );
}

export default FillBlankInput;
