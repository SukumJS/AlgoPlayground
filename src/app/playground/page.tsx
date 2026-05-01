"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter, notFound } from "next/navigation";
import { DnDProvider } from "@/src/components/visualizer/useDnD";
import { ReactFlowProvider } from "@xyflow/react";
import PlaygroundTree from "./PlaygroundTree";
import PlaygroundGraph from "./PlaygroundGraph";
import PlaygroundSort from "./PlaygroundSort";
import PlaygroundSearch from "./PlaygroundSearch";
import PlaygroundLinearDS from "./PlaygroundLinearDS";
import { algorithmCatalog } from "@/src/data/algorithmCatalog";
import { pretestService } from "@/src/services/pretest.service";

const TYPE_TO_CATALOG_ID: Record<string, string> = {
  tree: "tree",
  graph: "graph",
  sort: "sorting",
  search: "searching",
  "linear-ds": "linear-ds",
};

function PlaygroundRouter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const algoType = searchParams.get("type");
  const algorithm = searchParams.get("algorithm");

  const [pretestChecked, setPretestChecked] = useState(false);

  // Validate URL params; valid means catalog has this slug under this type.
  const catalogId = algoType ? TYPE_TO_CATALOG_ID[algoType] : undefined;
  const section = catalogId
    ? algorithmCatalog.find((sec) => sec.id === catalogId)
    : undefined;
  const isValid = Boolean(
    algoType &&
    algorithm &&
    catalogId &&
    section &&
    section.items.some((item) => item.slug === algorithm),
  );

  // Gate: require completed pretest before allowing playground access.
  useEffect(() => {
    if (!isValid || !algorithm || !algoType) return;

    let cancelled = false;
    const checkStatus = async () => {
      try {
        const res = await pretestService.checkPretestStatus(algorithm);
        if (cancelled) return;
        if (!res.data.data.completed) {
          router.replace(`/pretest?type=${algoType}&algorithm=${algorithm}`);
          return;
        }
        setPretestChecked(true);
      } catch {
        // On error, send user to pretest to be safe
        if (!cancelled) {
          router.replace(`/pretest?type=${algoType}&algorithm=${algorithm}`);
        }
      }
    };

    checkStatus();
    return () => {
      cancelled = true;
    };
  }, [isValid, algorithm, algoType, router]);

  if (!isValid) {
    notFound();
  }

  if (!pretestChecked) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-white">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  if (algoType === "tree") {
    return <PlaygroundTree algorithm={algorithm!} />;
  } else if (algoType === "graph") {
    return <PlaygroundGraph algorithm={algorithm!} />;
  } else if (algoType === "sort") {
    return <PlaygroundSort algorithm={algorithm!} />;
  } else if (algoType === "search") {
    return <PlaygroundSearch algorithm={algorithm!} />;
  } else if (algoType === "linear-ds") {
    return <PlaygroundLinearDS algorithm={algorithm!} />;
  }

  return notFound();
}

export default function Page() {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center w-screen h-screen">
              Loading...
            </div>
          }
        >
          <PlaygroundRouter />
        </Suspense>
      </DnDProvider>
    </ReactFlowProvider>
  );
}
