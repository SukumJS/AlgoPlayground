import { Circle, CircleCheck } from "lucide-react"


interface ProgressRowProps {
  label: string
  score: number // 0 - 5
  status: "locked" | "active" | "completed"
}


const getRowColors = (
  score: number,
  status: "locked" | "active" | "completed",
  isPretest: boolean
) => {
  if (status === "locked") {
    return {
      bg: "bg-[#E5E5E5]",
      text: "text-gray-600",
    }
  }

  if (status === "active") {
    return {
      bg: "bg-[#62A2F7]/30",
      text: "text-blue-700",
    }
  }

  // completed → ดูคะแนน
  if (score <= 2) {
    return {
      bg: "bg-red-100",
      text: "text-red-700",
    }
  }

  if (score <= 4) {
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    }
  }

  // full score
  return isPretest
    ? {
      bg: "bg-[#EAF2FF]",
      text: "text-blue-700",
    }
    : {
      bg: "bg-[#EAF7EA]",
      text: "text-green-700",
    }
}



export function ProgressRow({ label, score, status }: ProgressRowProps) {
  const isPretest = label.toLowerCase().includes("pre")


  const { bg, text } = getRowColors(score, status, isPretest)



  return (
    <div
      className={`
        min-w-[212px] px-[8px] py-[6px]
        rounded-[15px] flex items-center
        transition-colors duration-300
        ${bg}
      `}
    >

      {/* label - center */}
      <span className={`flex-1 text-[14px] ${text}`}>
        {label}
      </span>


      {/* score - right */}
      <span className={`text-[12px] text-center font-medium ${text} shrink-0 px-2`}>
        {status === "locked"
          ? "Not started"
          : status === "active"
            ? "In progress"
            : `${score} / 5`}
      </span>

    </div>
  )
}



