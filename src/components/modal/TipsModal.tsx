import ModalOverlay from "./ModalOverlay";
import { AlertTriangle } from "lucide-react";
import type { TipSection } from "@/src/types/exercise";

type TipsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: TipSection[];
};

export default function TipsModal({
  isOpen,
  onClose,
  title,
  sections,
}: TipsModalProps) {
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="w-105 rounded-xl bg-white p-6 shadow-lg">
        {/* ---------- Header ---------- */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
        </div>

        {/* ---------- Sections ---------- */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index}>
              <p className="mb-1 text-sm font-semibold text-gray-700">
                {section.label}
              </p>

              <pre
                className="
                  rounded-lg
                  bg-gray-100
                  p-4
                  text-sm
                  text-gray-800
                  whitespace-pre-wrap
                  wrap-break-word
                  max-h-64
                  overflow-y-auto
                "
              >
                {section.content}
              </pre>
            </div>
          ))}
        </div>

        {/* ---------- Footer ---------- */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer text-sm font-medium text-gray-600 hover:text-black"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
