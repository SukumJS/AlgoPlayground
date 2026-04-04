"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { House } from "lucide-react";
import Post_Test_modal from "@/src/components/shared/post_Test_modal";
import {
  hasCompletedPosttest,
  hasSeenPosttestReminder,
  markPosttestReminderSeen,
} from "./posttestCompletion";

type GoToHomePortalProps = {
  algorithm?: string;
  algoType?: string;
};

export default function GoToHome_Portal({
  algorithm,
  algoType,
}: GoToHomePortalProps) {
  const router = useRouter();
  const [showReminder, setShowReminder] = useState(false);

  const handleGoHome = () => {
    if (
      hasCompletedPosttest(algoType, algorithm) ||
      hasSeenPosttestReminder(algoType, algorithm)
    ) {
      router.push("/");
      return;
    }

    markPosttestReminderSeen(algoType, algorithm);
    setShowReminder(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoHome}
        className="bg-white p-2 rounded-full shadow-lg flex items-center font-semibold border border-gray-200 hover:shadow-lg hover:bg-gray-100 transition cursor-pointer"
      >
        <House color="#000000" />
      </button>
      <Post_Test_modal
        showModal={showReminder}
        onClose={() => setShowReminder(false)}
        algorithm={algorithm}
        algoType={algoType}
      />
    </>
  );
}
