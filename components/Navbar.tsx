"use client"
import Link from "next/link"
import { useState } from "react"

interface NavbarProps {
  onSelectCategory: (category: string) => void
}

export default function Navbar({ onSelectCategory }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string>("all")

  const items = [
    { label: "All algorithms", value: "all" },
    { label: "Linear DS", value: "linear-ds" },
    { label: "Tree", value: "tree" },
    { label: "Graph", value: "graph" },
    { label: "Sorting", value: "sorting" },
    { label: "Searching", value: "searching" },
  ]

  return (
    <div className="sticky top-[30px] flex justify-center z-50">
      <div
        className="
          relative
          w-[1380px] h-[80px]
          rounded-[50px]
          bg-[#B4D4F1]
          border border-black
          shadow-[0px_6px_18px_rgba(0,0,0,0.25)]
        "
      >
        {/* Title */}
        <div
          className="absolute left-[30px] inset-y-0 flex items-center text-[24px] font-bold uppercase leading-none text-[#222121]"
        >
          Algo playground
        </div>


        {/* Menu */}
        <div className="absolute left-[718px] top-[18px] flex gap-[16px] items-start">

          <button className="leading-none px-[10px] py-[10px] text-[20px] font-bold text-[#222121]">
            Home
          </button>

          {/* Dropdown */}
          <div className="relative w-[197px]">
            <button
              onClick={() => setOpen(!open)}
              className="
                leading-none w-full flex items-center justify-center gap-[10px]
                px-[10px] py-[10px] 
              "
            >
              <span
                className={`text-[20px] font-bold transition-colors
                  ${selected === "all" ? "text-[#5D5D5D]" : "text-[#222121]"}
                `}
              >
                algorithms
              </span>

              <div
                className={`w-[24px] h-[24px] relative
                  transition-transform duration-200
                  ${open ? "rotate-0" : "rotate-180"}
                `}
              >
                <div
                  className="
                    absolute left-[6px] top-[9px]
                    w-[12px] h-[6px]
                    outline outline-[4px]
                    outline-[#5D5D5D]
                    outline-offset-[-2px]
                  "
                />
              </div>
            </button>

            {open && (
              <div
                className="
                  absolute top-full mt-[6px] w-full
                  bg-white
                  rounded-[12px]
                  shadow-[0px_8px_20px_rgba(0,0,0,0.2)]
                  z-50
                  overflow-hidden
                "
              >
                {items.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => {
                      setSelected(item.value)
                      onSelectCategory(item.value)
                      setOpen(false)
                    }}
                    className={`
                      px-[10px] py-[10px]
                      text-center text-[20px]
                      cursor-pointer
                      hover:bg-[#E6EEF7]
                      ${
                      // hilight select item
                      selected === item.value
                        ? "text-[#1A75D1] font-bold"
                        : "text-[#222121]"
                      }
                    `}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="leading-none px-[10px] py-[10px] text-[20px] font-bold text-[#222121]">
            examples questions
          </button>
        </div>

        {/* Sign in */}
        <Link href="/auth/login">
          <div className="absolute right-[15px] top-[15px] w-[100px] h-[50px] cursor-pointer">
            <div className="w-full h-full bg-[#1A75D1] rounded-[35px] shadow-[0px_4px_10px_rgba(0,0,0,0.25)]" />
            <div
              className="absolute inset-0 flex items-center justify-center
      text-[16px] font-bold leading-none text-[#F1F1F1]"
            >
              Sign in
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}
