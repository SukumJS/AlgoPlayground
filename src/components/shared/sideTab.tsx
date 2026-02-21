"use client";

import React, { useState } from "react";
import { Menu, X} from "lucide-react";

interface RightSidebarProps {
  children: React.ReactNode; // รับคอมโพเนนต์เฉพาะทางเข้ามาที่นี่
  title: string;
}

export default function Sidebar({ children, title }: RightSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside 
      className={`fixed right-0 top-0 h-full bg-white transition-all duration-300 ease-in-out z-50 border-l shadow-xl flex flex-col ${
        isOpen ? "w-96 lg:w-108" : "w-16 overflow-hidden"
      }`}
    >
      {/* Header */}
      <div className="relative flex items-center h-16 p-4 shrink-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:scale-110 transition-transform"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
        {isOpen && <h1 className="text-xl font-bold mx-auto">{title}</h1>}
      </div>

      {/* Content */}
      {isOpen && (
        <div className="px-4 flex flex-col justify-between grow overflow-y-auto gap-4">
          {children}
        </div>
      )}
    </aside>
  );
}