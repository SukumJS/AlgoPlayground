"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CodeAlgo() {
    const [isCodeOpen, setIsCodeOpen] = useState(false);

    return (
        <button className={`flex border-b border-black text-lg p-2 h-12 justify-between transition-all duration-300 ease-in-out z-50 ${isCodeOpen ? "h-120" : "h-10" }`} onClick={() => setIsCodeOpen(!isCodeOpen)}>
            Code
            {isCodeOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
    )
}