"use client";

import React from "react";
import Link from "next/link";
import ModalOverlay from "../excercise/ModalOverlay";
import { TriangleAlert } from "lucide-react";

type post_test_modalProps = {
  showModal: boolean;
  onClose: () => void;
  onTakeTest?: () => void;
  algorithm?: string;
  algoType?: string;
};

const post_Test_modal = ({
  showModal,
  onClose,
  onTakeTest,
  algorithm,
  algoType,
}: post_test_modalProps) => {
  const href = algorithm
    ? `/posttest?type=${encodeURIComponent(algoType || "sorting")}&algorithm=${encodeURIComponent(algorithm)}`
    : "/posttest";

  return (
    <ModalOverlay isOpen={showModal} onClose={onClose}>
      <div className="w-full max-w-148 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
        <div className="w-10 h-10 rounded-full bg-[#FDEFDA] flex items-center justify-center mb-4">
          <TriangleAlert color="#F7AD45" size={24} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">
            Don&apos;t Forget Your Post-Test!
          </h1>
          <p className="pt-2 text-[#222121]">
            You&apos;ve been exploring the playground for a while. Let&apos;s
            take a quick post-test to see what you&apos;ve learned before you
            go!
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
            }}
            className="bg-gray-100 text-[#222121] w-auto px-4 h-10 rounded-md mt-8 hover:bg-gray-200"
          >
            Maybe Later
          </button>
          <Link
            href={href}
            onClick={onTakeTest}
            className="bg-[#0066CC] text-white w-auto px-4 h-10 rounded-md mt-8 inline-flex items-center justify-center hover:bg-[#0470dd]"
          >
            Take the Test
          </Link>
        </div>
      </div>
    </ModalOverlay>
  );
};
export default post_Test_modal;
