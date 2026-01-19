"use client"
import { useRouter } from "next/navigation"
import { ProgressRow } from "./ProgressRow"
import { Info } from "lucide-react"

interface Props {
  slug: string
  title: string
  progress: {
    pretest: {
      percent: number
      status: "locked" | "active" | "completed"
    }
    posttest: {
      percent: number
      status: "locked" | "active" | "completed"
    }
  }
}

export default function AlgorithmCard({ slug, title, progress }: Props) {
  const router = useRouter()

  //กดการ์ด = ไปหน้า pretest เสมอ
  const handleCardClick = () => {
    router.push(`/pretest/${slug}`)
  }

  // กด Info = ดูข้อมูล (ไม่เปลี่ยนหน้า)
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation() // ป้องกันไม่ให้เกิดการเรียก handleCardClick
    console.log("Algorithm slug:", slug)
  }
  return (
    <div
      onClick={handleCardClick}
      className="
        relative
        w-60 h-[22rem]
        rounded-3xl
        shadow-lg
        bg-transparent
        cursor-pointer
        transition
        hover:scale-[1.02]
      "
    >
      {/* Header */}
      <div
        className="
          absolute inset-x-0 top-0
          h-40
          bg-gradient-to-b
          from-[#00478F] via-[#005CB8] to-[#4D94DB]
          rounded-t-3xl
        "
      />

      {/* Top right icon */}
      <Info
        onClick={(e) => {
          e.stopPropagation()      
          console.log("Algorithm slug:", slug)
          router.push(`/document/${slug}`)
        }}
        className="
    absolute top-4 right-4
    w-6 h-6
    text-white
    cursor-pointer
    hover:opacity-80
  "
      />

      {/* Icons */}
      <div className="absolute top-20 left-14 w-8 h-7 bg-white rounded-sm" />
      <div className="absolute top-20 left-28 w-8 h-7 bg-white rounded-sm" />
      <div className="absolute top-20 left-44 w-8 h-7 bg-white rounded-sm" />

      {/* Body */}
      <div
        className="
          absolute inset-x-0 bottom-0
          h-44
          bg-white
          rounded-b-3xl
          flex flex-col items-center justify-start
          p-6 gap-4
        "
      >
        <h2 className="text-lg font-semibold text-gray-900 text-center leading-tight">
          {title}
        </h2>

        <ProgressRow
          label="Pretest"
          percent={progress.pretest.percent}
          status={progress.pretest.status}
        />

        <ProgressRow
          label="Post-test"
          percent={progress.posttest.percent}
          status={progress.posttest.status}
        />
      </div>
    </div>
  )
}
