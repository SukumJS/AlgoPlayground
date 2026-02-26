"use client";
import React, { Suspense } from "react";
import { useSearchParams, notFound } from "next/navigation";
import { DnDProvider } from "@/src/components/visualizer/useDnD";
import { ReactFlowProvider } from "@xyflow/react";
import PlaygroundTree from "./PlaygroundTree";
import PlaygroundGraph from "./PlaygroundGraph";
import PlaygroundSort from "./PlaygroundSort";
import { algorithmCatalog } from "@/src/data/algorithmCatalog";

function PlaygroundRouter() {
    const searchParams = useSearchParams();
    const algoType = searchParams.get("type");
    const algorithm = searchParams.get("algorithm");

    const typeToCatalogId: Record<string, string> = {
        "tree": "tree",
        "graph": "graph",
        "sort": "sorting",
    };

    if (!algoType || !algorithm || !typeToCatalogId[algoType]) {
        notFound();
    }

    const catalogId = typeToCatalogId[algoType];
    const section = algorithmCatalog.find(sec => sec.id === catalogId);

    if (!section || !section.items.some(item => item.slug === algorithm)) {
        notFound();
    }

    if (algoType === "tree") {
        return <PlaygroundTree algorithm={algorithm} />;
    } else if (algoType === "graph") {
        return <PlaygroundGraph algorithm={algorithm} />;
    } else if (algoType === "sort") {
        return <PlaygroundSort algorithm={algorithm} />;
    }

    return notFound();
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