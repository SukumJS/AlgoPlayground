"use client";

import React from "react";

type ChoiceCardProps = {
  id: string;
  text: string;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
  className?: string;
};

function ChoiceCard({
  id,
  text,
  isSelected,
  disabled = false,
  onSelect,
  className = "",
}: ChoiceCardProps) {
  const getBackgroundStyle = () => {
    // Highlight selected choice
    if (isSelected) {
      return "bg-[#BFDBFE] border-[#BFDBFE]";
    }

    return "bg-white border-gray-200 hover:border-gray-300";
  };

  return (
    <button
      onClick={() => !disabled && onSelect(id)}
      disabled={disabled}
      className={`
        relative flex items-center w-full min-h-[70px] px-6 py-4 
        rounded-2xl border shadow-md transition-all duration-200 
        ${getBackgroundStyle()}
        ${disabled ? "cursor-default" : "cursor-pointer"}
        ${className}
      `}
    >
      {/* Choice text */}
      <p className="text-base sm:text-base text-left text-[#222121]">{text}</p>
    </button>
  );
}

export default ChoiceCard;
