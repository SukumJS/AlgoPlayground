"use client";

import { useSearchParams, notFound } from "next/navigation";
import Image from "next/image";
import { ALGO_CONTENT, ContentReading } from "../../data/ContentReading";

export default function ReadingPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const data: ContentReading | undefined = ALGO_CONTENT.find(
    (item) => item.id === id
  );

  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-12 py-6">
      {/* Title */}
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-[#62A2F7] px-6 py-1 text-lg font-bold text-black shadow border border-black">
          {data.title}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl space-y-8 rounded-xl border bg-white p-6 shadow-md">
        {data.sections.map((section, index) => (
          <section key={index} className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-5 w-1 rounded-full bg-[#ACC7FA]" />
              <h2 className="text-lg font-bold">{section.heading}</h2>
            </div>

            {/* Text */}
            {section.content?.map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-700">
                {line}
              </p>
            ))}

            {/* List */}
            {section.list && (
              <ol className="ml-6 list-decimal text-sm text-gray-700">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            )}

            {/* Images */}
            {section.image && (
              <div className="space-y-4">
                {section.image.map((img, i) => (
                  <div key={i} className="relative h-64 w-full">
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

            {/* Code */}
            {section.code && (
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                <code>{section.code.value}</code>
              </pre>
            )}

            {index !== data.sections.length - 1 && (
              <hr className="pt-4" />
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
