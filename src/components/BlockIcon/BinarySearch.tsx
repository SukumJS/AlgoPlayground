import Block from "./Block"

interface Props {
    className?: string
}

export default function BinarySearchIcon({ className = "" }: Props) {
    return (
        <div
            className={`
        flex items-center justify-center gap-1
        w-32 h-24 pb-15
        group
        ${className}
      `}
        >
            <div className="flex items-center justify-center gap-1 h-12 group">
                {/* left half */}
                <Block
                    className="
          w-8 h-8
          transition-all duration-300
          group-hover:-translate-x-4
          group-hover:opacity-30
        "
                />
                <Block
                    className="
          w-8 h-8
          transition-all duration-300
          group-hover:-translate-x-4
          group-hover:opacity-30
        "
                />

                {/* mid */}
                <Block
                    className="
          w-8 h-8
          transition-all duration-300
          group-hover:scale-110
          group-hover:bg-blue-300
        "
                />

                {/* right half */}
                <Block
                    className="
          w-8 h-8
          transition-all duration-300
          group-hover:translate-x-4
          group-hover:opacity-70
        "
                />
                <Block
                    className="
          w-8 h-8
          transition-all duration-300
          group-hover:translate-x-4
          group-hover:bg-blue-300
        "
                />
            </div>
        </div>
    )
}
