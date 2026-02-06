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
            className={`flex border-b border-black text-lg p-2 justify-between transition-all duration-300 ease-in-out z-50 ${isExplain ? "h-120" : "h-10"} ${tutorialMode ? "cursor-default opacity-60" : ""}`}
            onClick={handleClick}
        >
            Explain
            {isExplain ? <ChevronUp /> : <ChevronDown />}
        </button>
    )
}