"use client";
import React from "react";
import { X } from "lucide-react";
import ModalOverlay from "../excercise/ModalOverlay";
import { useSearchParams } from "next/navigation";
import { ALGO_CONTENT } from "@/src/data/ContentReading";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function Reading_modal({ isOpen, onClose }: Props) {
  const searchParams = useSearchParams();
  const algorithmId = searchParams.get("algorithm");

  const data = ALGO_CONTENT.find((item) => item.id === algorithmId);

  if (!data) {
    return (
      <ModalOverlay isOpen={isOpen} onClose={onClose}>
        <div className="w-172 h-40 bg-white border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4">
            <X
              className="cursor-pointer text-gray-500 hover:text-black"
              onClick={onClose}
            />
          </div>
          <p className="text-gray-500">Content not found for this algorithm.</p>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="w-172 h-156 bg-white border border-gray-300 rounded-lg p-6 flex flex-col">
        <div className="flex justify-end mb-2">
          <X
            className="cursor-pointer text-gray-500 hover:text-black"
            onClick={onClose}
          />
        </div>

        <div className="overflow-y-auto flex-1 pr-2 space-y-8">
          {data.sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1.5 rounded-full bg-blue-500"></div>
                <h2 className="text-xl font-bold text-gray-800">
                  {section.heading}
                </h2>
              </div>

              {section.content &&
                section.content.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className="text-gray-700 text-justify leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}

              {section.list && (
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  {section.list.map((item, lIndex) => (
                    <li key={lIndex}>{item}</li>
                  ))}
                </ul>
              )}

              {section.image && (
                <div className="space-y-4 my-6">
                  {section.image.map((img, i) => (
                    <div
                      key={i}
                      className="relative h-64 w-full rounded-lg overflow-hidden"
                    >
                      <Image
                        src={img}
                        alt={`${section.heading}-${i}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}

              {section.code && (
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100 mt-4">
                  <code>{section.code.value}</code>
                </pre>
              )}

              {index !== data.sections.length - 1 && (
                <hr className="mt-8 border-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </ModalOverlay>
  );
}

export default Reading_modal;
