"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type PostTestPortalProps = {
  algorithm?: string;
  algoType?: string;
};

export default function PostTest_portal({
  algorithm,
  algoType,
}: PostTestPortalProps) {
  const href = algorithm
    ? `/posttest?type=${encodeURIComponent(algoType || "sorting")}&algorithm=${encodeURIComponent(algorithm)}`
    : "/posttest";

  return (
    <Link href={href}>
      <div
        data-tutorial-posttest="true"
        className="w-full h-12 text-lg p-2 mr-2
            flex items-center justify-between 
            border-t border-black bg-white
            hover:bg-gray-100 cursor-pointer"
      >
        <span>Post Test</span>
        <ChevronRight />
      </div>
    </Link>
  );
}
