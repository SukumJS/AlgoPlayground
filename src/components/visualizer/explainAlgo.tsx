"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExplainAlgoProps {
    tutorialMode?: boolean;
}

export default function ExplainAlgo({ tutorialMode = false }: ExplainAlgoProps) {
    const [isExplain, setIsExplain] = useState(false);

    const handleClick = () => {
        if (!tutorialMode) {
            setIsExplain(!isExplain);
        }
    };

    return (
        <button
            className={`flex border-b border-black text-lg p-2 justify-between transition-all duration-300 ease-in-out z-50 h-12 w-full ${isExplain ? "h-56" : "h-10" }`}
            onClick={handleClick}
        >
            Explain
            {isExplain ? <ChevronUp /> : <ChevronDown />}
        </button>
    )
}