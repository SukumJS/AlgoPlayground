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
      className={`fixed right-0 top-0 h-full bg-white transition-all duration-300 ease-in-out z-50 border-l shadow-xl overflow-auto ${
        isOpen ? "w-96" : "w-16"
      }`}
    >
      {/* ปุ่ม Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-3 top-4 p-1 hover:scale-110 transition-transform"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {isOpen && (
        <div className="p-6 flex flex-col justify-between overflow-auto gap-4 mt-8">
          {children} {/* แสดงเนื้อหาที่ส่งมาจากแต่ละ Page */}
        </div>
      )}
    </aside>
  );
}