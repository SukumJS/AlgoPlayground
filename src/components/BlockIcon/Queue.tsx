import Block from "./Block"

interface Props {
  className?: string
}

export default function QueueIcon({ className = "" }: Props) {
  return (
    <div className={`flex items-center gap-1 pb-12 ${className}`}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center w-8">
          <div className="h-4 mb-1 text-[10px] text-white/70 text-center">
            {i === 0 && "Front"}
            {i === 3 && "Rear"}
          </div>
          <Block className="w-8 h-8" />
        </div>
      ))}
    </div>
  )
}
