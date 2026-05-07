"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface RightSidebarProps {
  children: React.ReactNode; // รับคอมโพเนนต์เฉพาะทางเข้ามาที่นี่
  title: string;
  onToggle?: (isOpen: boolean) => void;
}

export default function Sidebar({
  children,
  title,
  onToggle,
}: RightSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleForceOpen = () => {
      setIsOpen(true);
      if (onToggle) onToggle(true);
    };
    window.addEventListener("forceOpenSidebar", handleForceOpen);
    return () =>
      window.removeEventListener("forceOpenSidebar", handleForceOpen);
  }, [onToggle]);

  //  สร้างฟังก์ชันคุมการเปิด/ปิด
  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState); // 1. เปลี่ยนสถานะของตัวเอง
    if (onToggle) {
      onToggle(newState); // 2. ส่งสถานะใหม่กลับไปบอกหน้าหลัก
    }
  };

  return (
    <aside
      className={`fixed right-0 top-0 h-full bg-white transition-all duration-300 ease-in-out z-50 border-l shadow-xl flex flex-col ${
        isOpen ? "w-72 md:w-80 lg:w-108" : "w-16 overflow-hidden"
      }`}
    >
      {/* Header */}
      <div className="relative flex items-center h-16 p-4 shrink-0">
        <button
          onClick={handleToggle}
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
