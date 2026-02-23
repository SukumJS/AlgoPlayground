"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DnDProvider } from "@/src/components/visualizer/useDnD";
import { ReactFlowProvider } from "@xyflow/react";
import PlaygroundTree from "./PlaygroundTree";
import PlaygroundGraph from "./PlaygroundGraph";
import PlaygroundSort from "./PlaygroundSort";

function PlaygroundRouter() {
    const searchParams = useSearchParams();
    const algoType = searchParams.get("type");
    const algorithm = searchParams.get("algorithm") || "";

    if (algoType === "tree") {
        return <PlaygroundTree algorithm={algorithm} />;
    } else if (algoType === "graph") {
        return <PlaygroundGraph algorithm={algorithm} />;
    } else {
        return <PlaygroundSort algorithm={algorithm} />;
    }
}

export default function Page() {
    return (
        <ReactFlowProvider>
            <DnDProvider>
                <Suspense fallback={<div className="flex items-center justify-center w-screen h-screen">Loading...</div>}>
                    <PlaygroundRouter />
                </Suspense>
            </DnDProvider>
        </ReactFlowProvider>
    );
}