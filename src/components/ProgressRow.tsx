import { Circle, CircleCheck } from "lucide-react"

interface ProgressRowProps {
  label: string
  percent: number
  status: "locked" | "active" | "completed"
}

export function ProgressRow({ label, percent, status }: ProgressRowProps) {
  const lockedStyles = {
    bg: "bg-[#E5E5E5]",
    text: "text-[#6B6B6B]",
    badge: "bg-[#9E9E9E]",
  }

  const typeStyles = {
    pretest: {
      bg: "bg-[#EAF7EA]",
      text: "text-[#2E7D32]",
      badge: "bg-[#2E7D32]",
    },
    posttest: {
      bg: "bg-[#EAF2FF]",
      text: "text-[#1E5EFF]",
      badge: "bg-[#1E5EFF]",
    },
  }

  const isPretest = label.toLowerCase().includes("pre")

  const styles =
    status === "locked"
      ? lockedStyles
      : isPretest
      ? typeStyles.pretest
      : typeStyles.posttest

  return (
    <div
      className={`min-w-[212px] px-[8px] py-[6px]
      rounded-[15px] flex items-center justify-between
      ${styles.bg}`}
    >
      {/* icon */}
      {percent === 100 && status !== "locked" ? (
        <CircleCheck className={`w-[18px] h-[18px] ${styles.text}`} />
      ) : (
        <Circle className={`w-[18px] h-[18px] ${styles.text}`} />
      )}

      <span className={`text-[14px] ${styles.text}`}>
        {label}
      </span>

      <span
        className={`text-white text-[12px]
        px-[6px] py-[2px] rounded-[10px]
        ${styles.badge}`}
      >
        {percent}%
      </span>
    </div>
  )
}
