"use client";

import { useParams } from "next/navigation";

/* ---------------- Mock Data ---------------- */
const MOCK_STRUCTURE = {
  id: "1",
  title: "SINGLY LINKED LIST",
  sections: [
    {
      heading: "WHAT IS SINGLY LINKED LIST?",
      content: [
        "A Singly Linked List is a linear data structure where each element (node) contains data and a pointer to the next node.",
        "Unlike arrays, linked lists don't have fixed sizes and allow efficient insertion/deletion at any position.",
        "The list maintains a head pointer that points to the first node. The last node's next pointer is null, indicating the end of the list.",
        "This structure provides O(1) insertion/deletion at the head but O(n) access time for arbitrary elements.",
        "Singly linked lists are fundamental building blocks for more complex data structures like stacks, queues, and adjacency lists for graphs.",
      ],
    },
    {
      heading: "INSERTION PROCESS",
      list: [
        "Create new node with given data",
        "Set new node's next to current head",
        "Update head pointer to new node",
        "Increment list size counter",
      ],
    },
    {
      heading: "DELETION PROCESS",
      list: [
        "Check if list is empty (head === null)",
        "If deleting head, update head to head.next",
        "Otherwise traverse to previous node",
        "Update previous.next to skip deleted node",
        "Decrement list size counter",
      ],
    },
  ],
};


export default function StructureDetailPage() {
  const { id } = useParams(); 

  // TODO: replace mock with DB fetch using id
  const data = MOCK_STRUCTURE;

  return (
    <main className="mx-auto max-w-12xl px-12 py-6">
      {/* ---------- Title Pill ---------- */}
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-[#62A2F7] px-5 py-1 text-lg font-bold tracking-wide text-black shadow border border-black">
          {data.title}
        </div>
      </div>

      {/* ---------- Content Card ---------- */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md space-y-6">
        {data.sections.map((section, index) => (
          <section key={index}>
            {/* Section Heading */}
            <div className="mb-2 flex items-start gap-2">
              <div className="mt-1 h-5 w-1 rounded-full bg-[#ACC7FA]" />
              <h2 className="text-lg font-bold tracking-wide">
                {section.heading}
              </h2>
            </div>

            {/* Paragraph Content */}
            {section.content && (
              <div className="space-y-2 text-sm leading-relaxed text-gray-700">
                {section.content.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {/* Ordered List */}
            {section.list && (
              <ol className="ml-6 list-decimal space-y-1 text-sm text-gray-700">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            )}

            {/* Divider */}
            {index !== data.sections.length - 1 && (
              <hr className="mt-4 border-gray-200" />
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
