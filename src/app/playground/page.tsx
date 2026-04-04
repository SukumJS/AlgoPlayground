"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, notFound } from "next/navigation";
import { DnDProvider } from "@/src/components/visualizer/useDnD";
import { ReactFlowProvider } from "@xyflow/react";
import PlaygroundTree from "./PlaygroundTree";
import PlaygroundGraph from "./PlaygroundGraph";
import PlaygroundSort from "./PlaygroundSort";
import PlaygroundSearch from "./PlaygroundSearch";
import PlaygroundLinearDS from "./PlaygroundLinearDS";
import { algorithmCatalog } from "@/src/data/algorithmCatalog";
import Post_Test_modal from "@/src/components/shared/post_Test_modal";
import {
  hasCompletedPosttest,
  hasSeenPosttestReminder,
  markPosttestReminderSeen,
} from "@/src/components/shared/posttestCompletion";

type BrowserBackPosttestGuardProps = {
  algoType: string;
  algorithm: string;
};

function BrowserBackPosttestGuard({
  algoType,
  algorithm,
}: BrowserBackPosttestGuardProps) {
  const [hasDeferredReminder, setHasDeferredReminder] = useState(() => {
    if (typeof window === "undefined") return false;
    return hasSeenPosttestReminder(algoType, algorithm);
  });

  const [showReminder, setShowReminder] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      !hasCompletedPosttest(algoType, algorithm) &&
      hasSeenPosttestReminder(algoType, algorithm)
    );
  });

  useEffect(() => {
    if (hasCompletedPosttest(algoType, algorithm)) {
      return;
    }

    // After user chooses "Maybe Later" in this visit, allow leaving playground.
    if (hasDeferredReminder) {
      return;
    }

    const GUARD_KEY = "posttestBackGuard";

    const pushGuardState = () => {
      const nextState = { ...(window.history.state ?? {}), [GUARD_KEY]: true };
      window.history.pushState(nextState, "", window.location.href);
    };

    if (!window.history.state?.[GUARD_KEY]) {
      pushGuardState();
    }

    const handlePopState = () => {
      setShowReminder(true);
      pushGuardState();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [algoType, algorithm, hasDeferredReminder]);

  return (
    <Post_Test_modal
      showModal={showReminder}
      onClose={() => {
        markPosttestReminderSeen(algoType, algorithm);
        setHasDeferredReminder(true);
        setShowReminder(false);
      }}
      algorithm={algorithm}
      algoType={algoType}
    />
  );
}

function PlaygroundRouter() {
  const searchParams = useSearchParams();
  const algoType = searchParams.get("type");
  const algorithm = searchParams.get("algorithm");

  const typeToCatalogId: Record<string, string> = {
    tree: "tree",
    graph: "graph",
    sort: "sorting",
    search: "searching",
    "linear-ds": "linear-ds",
  };

  if (!algoType || !algorithm || !typeToCatalogId[algoType]) {
    notFound();
  }

  const catalogId = typeToCatalogId[algoType];
  const section = algorithmCatalog.find((sec) => sec.id === catalogId);

  if (!section || !section.items.some((item) => item.slug === algorithm)) {
    notFound();
  }

  let content: React.ReactNode = null;

  if (algoType === "tree") {
    content = <PlaygroundTree algorithm={algorithm} />;
  } else if (algoType === "graph") {
    content = <PlaygroundGraph algorithm={algorithm} />;
  } else if (algoType === "sort") {
    content = <PlaygroundSort algorithm={algorithm} />;
  } else if (algoType === "search") {
    content = <PlaygroundSearch algorithm={algorithm} />;
  } else if (algoType === "linear-ds") {
    content = <PlaygroundLinearDS algorithm={algorithm} />;
  } else {
    notFound();
  }

  return (
    <>
      <BrowserBackPosttestGuard
        key={`${algoType}:${algorithm}`}
        algoType={algoType}
        algorithm={algorithm}
      />
      {content}
    </>
  );
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
