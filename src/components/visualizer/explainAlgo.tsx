"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ExplainAlgo() {
    const [isExplain, setIsExplain] = useState(false);

    return (
        <button className={`flex border-b border-black text-lg p-2 justify-between transition-all duration-300 ease-in-out z-50 h-12 w-full ${isExplain ? "h-56" : "h-10" }`} onClick={() => setIsExplain(!isExplain)}>
            Explain
            {isExplain ? <ChevronUp /> : <ChevronDown />}
        </button>
    )
}