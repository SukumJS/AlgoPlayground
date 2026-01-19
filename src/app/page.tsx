"use client"

import { useState } from "react"
import Navbar from "../components/Navbar"
import AlgorithmSection from "../components/AlgorithmSection"
import { algorithmCatalog } from "../data/algorithmCatalog"

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoggedIn, setIsLoggedIn] = useState(true) //  mock login state ถ้าจะเปลี่ยนเป็นยังไม่ล็อกอินเปลี่ยนเป็น falese
  return (
    <div className="min-h-screen bg-white">
      <Navbar onSelectCategory={setSelectedCategory} isLoggedIn={isLoggedIn} />

      <main className="pt-[96px]">
        <div className="mx-auto max-w-[1380px] px-[30px]">
          {(selectedCategory === "all"
            ? algorithmCatalog
            : algorithmCatalog.filter(
                (section) => section.id === selectedCategory
              )
          ).map((section) => (
            <AlgorithmSection
              key={section.id}
              title={section.title}
              items={section.items}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
