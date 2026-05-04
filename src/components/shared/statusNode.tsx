"use client";
import React from "react";
import { useSearchParams } from "next/navigation";

// type Props = {}

export default function StatusNode() {
  const searchParams = useSearchParams();
  const isTree = searchParams.get("type") === "tree";
  const isSearch = searchParams.get("type") === "searching";
  const isGraph = searchParams.get("type") === "graph";

  return (
    <div className="bg-white border border-gray-100 shadow-lg w-auto h-auto flex rounded-2xl gap-4 p-2 flex-wrap">
      {/* Status Node Component displaying current state and processing indicators */}
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-[#62A2F7] w-3 h-3 mx-auto" />
        <p className="text-gray-500 font-medium">Current State</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-[#F19F72] w-3 h-3 mx-auto" />
        <p className="text-gray-500 font-medium">Processing</p>
      </div>

      {/* Tree-specific */}
      {isTree && (
        <>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#EF4444] w-3 h-3 mx-auto" />
            <p className="text-gray-500 font-medium">Rejected</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#4CAF7D] w-3 h-3 mx-auto" />
            <p className="text-gray-500 font-medium">Success</p>
          </div>
        </>
      )}
      {/* Search-specific */}
      {isSearch && (
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#4CAF7D] w-3 h-3 mx-auto" />
          <p className="text-gray-500 font-medium">Found</p>
        </div>
      )}
      {/* Graph-specific */}
      {isGraph && (
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[#4CAF7D] w-3 h-3 mx-auto" />
          <p className="text-gray-500 font-medium">Found Path</p>
        </div>
      )}
    </div>
  );
}
