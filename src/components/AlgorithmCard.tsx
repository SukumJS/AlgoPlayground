"use client"
import { useRouter } from "next/navigation"
import { ProgressRow } from "./ProgressRow"
import { Info } from "lucide-react"
import { AlgorithmIcon } from "./AlgorithmIcon"


interface Props {
  slug: string
  title: string
  shortTitle?: string
  progress: {
    pretest: {
      score?: number
      status: "locked" | "active" | "completed"
    }
    posttest: {
      score?: number
      status: "locked" | "active" | "completed"
    }
  }
}
export default function AlgorithmCard({ slug, title, shortTitle, progress }: Props) {
  const router = useRouter()

  //กดการ์ด = ไปหน้า pretest เสมอ
  // const handleCardClick = () => {
  //   router.push(`/pretest/${slug}`)
  // }

  const handleCardClick = () => {
    router.push(`/pretest`)
  }

  // กด Info = ดูข้อมูล (ไม่เปลี่ยนหน้า)
  // const handleInfoClick = (e: React.MouseEvent) => {
  //   e.stopPropagation() // ป้องกันไม่ให้เกิดการเรียก handleCardClick
  //   console.log("Algorithm slug:", slug)
  // }
  return (
    <div
      onClick={handleCardClick}
      className="
        group
        relative
        w-60 h-[22rem]
        rounded-3xl
        shadow-lg
        bg-transparent
        cursor-pointer
        transition
        hover:scale-[1.02]
        group-hover:bg-red-500
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
          router.push(`/reading?id=${slug}`)
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
      <AlgorithmIcon
        slug={slug}
        status={progress.pretest.status}
        className="
        absolute pb-4 top-[4.5rem] left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center text-white"
      />

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
        <h2 className="text-lg font-semibold text-gray-900 text-center leading-tight relative -top-3" title={title}>
          {shortTitle ?? title}
        </h2>

        <ProgressRow
          label="Pretest"
          score={progress.pretest.score}
          status={progress.pretest.status}
        />

        <ProgressRow
          label="Posttest"
          score={progress.posttest.score}
          status={progress.posttest.status}
        />
      </div>
    </div>
  )
}