"use client";

import { AlertTriangle } from "lucide-react";
import ModalOverlay from "../excercise/ModalOverlay";

type IncompleteQuizModalProps = {
  isOpen: boolean;
  onClose: () => void;
  unansweredCount: number;
  totalCount: number;
};

export default function IncompleteQuizModal({
  isOpen,
  onClose,
  unansweredCount,
  totalCount,
}: IncompleteQuizModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="w-116 rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            You have not answered all questions yet!
          </h2>
        </div>

        <p className="text-sm text-gray-700">
          Please answer all questions before submitting your answers (
          {unansweredCount} out of {totalCount} questions unanswered).
        </p>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-[#0066cc] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0052a3]"
          >
            Back
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
