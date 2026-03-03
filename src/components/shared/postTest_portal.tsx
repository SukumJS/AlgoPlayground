"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PostTest_portal() {
  return (
    <Link href="/pretest">
      <div
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
