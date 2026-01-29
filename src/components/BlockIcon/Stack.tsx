interface Props {
    className?: string
}
export default function StackIcon({ className = "" }: Props) {
  return (
    <div className={`flex flex-col items-center gap-1 pb-10 ${className}`}>
      <span className="text-[10px] text-white opacity-70">Top</span>

      <div className="flex flex-col-reverse">
        {["A", "B", "C"].map((v, i) => (
          <div
            key={v}
            className={`w-10 h-8 border border-white flex items-center justify-center text-xs text-white ${
              i === 2 ? "bg-white/10" : ""
            }`}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  )
}