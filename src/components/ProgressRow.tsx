interface ProgressRowProps {
  label: string
  percent: number
  status: "locked" | "active" | "completed"
}

export function ProgressRow({ label, percent, status }: ProgressRowProps) {
  const styles = {
    locked: {
      bg: "bg-[#DCDBDB]",
      text: "text-[#5D5D5D]",
      ring: "outline-[#5D5D5D]",
      badge: "bg-[#919090]",
    },
    active: {
      bg: "bg-[rgba(98,162,247,0.2)]",
      text: "text-[#00478F]",
      ring: "outline-[#0066CC]",
      badge: "bg-[#0066CC]",
    },
    completed: {
      bg: "bg-[rgba(56,176,0,0.2)]",
      text: "text-[#1C5800]",
      ring: "outline-[#38B000]",
      badge: "bg-[#38B000]",
    },
  }[status]

  return (
    <div
      className={`min-w-[212px] px-[5px] py-[5px]
        rounded-[15px] flex items-center justify-between
        ${styles.bg}`}
    >
      {/* circle */}
      <div
        className={`w-[18px] h-[18px] rounded-full
          outline outline-[2px] ${styles.ring}
          flex items-center justify-center
          ${styles.text}`}
      >
        {status !== "locked" && (
          <div className="w-[9px] h-[7px] bg-current" />
        )}
      </div>

      <span className={`text-[14px] leading-none ${styles.text}`}>
        {label}
      </span>

      <span
        className={`text-white text-[12px] leading-none
          px-[5px] py-[2px] rounded-[10px]
          ${styles.badge}`}
      >
        {percent}%
      </span>
    </div>
  )
}
