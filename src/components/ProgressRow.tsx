import { Circle, CircleCheck } from "lucide-react"


interface ProgressRowProps {
  label: string
  score: number // 0 - 5
  status: "locked" | "active" | "completed"
}


const getRowBgColor = (
  score: number,
  status: "locked" | "active" | "completed",
  isPretest: boolean
) => {
  if (status === "locked") return "bg-[#E5E5E5]"


  if (score <= 2) return "bg-red-100"
  if (score <= 4) return "bg-yellow-100"


  return isPretest ? "bg-[#EAF2FF]" : "bg-[#EAF7EA]"
}


export function ProgressRow({ label, score, status }: ProgressRowProps) {
  const isPretest = label.toLowerCase().includes("pre")


  const bgColor = getRowBgColor(score, status, isPretest)


  const textColor =
    status === "locked"
      ? "text-[#6B6B6B]"
      : isPretest
      ? "text-blue-700"
      : "text-green-700"


  const statusLabel =
    status === "locked"
      ? "Not start"
      : status === "active"
      ? "progress"
      : "Completed"


  return (
    <div
      className={`
        min-w-[212px] px-[8px] py-[6px]
        rounded-[15px] flex items-center
        transition-colors duration-300
        ${bgColor}
      `}
    >
      
      {/* label - center */}
      <span className={`flex-1  text-[14px] ${textColor}`}>
        {label}
      </span>


      {/* score - right */}
      <span className={`text-[12px] text-center font-medium ${textColor} shrink-0  px-2`}>
        {status === "completed" ? `${score} / 5` : "— / 5"}
      </span>
      
    </div>
  )
}



