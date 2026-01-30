import Block from "./Block"

interface Props {
    className?: string
}

export default function BubbleSortIcon({ className = "" }: Props) {
    return (
        <div
            className={`flex items-end justify-center gap-1 w-32 h-32 pb-15  ${className}`}
        >
            <Block className="w-8 h-8" />

            {/* block 2 (swap left) */}
            <Block
                className="
          w-8 h-12
          transition-all duration-300
          group-hover:bg-blue-300
          group-hover:translate-x-2
        "
            />

            {/* block 3 (swap right) */}
            <Block
                className="
          w-8 h-16
          transition-all duration-300
          group-hover:bg-blue-300
          group-hover:-translate-x-2
        "
            />

            {/* block 4 (นิ่ง) */}
            <Block className="w-8 h-20" />
        </div>
    )
}

