import Block from "./Block"

interface Props {
    className?: string
}

export default function LinearSearchIcon({ className = "" }: Props) {
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
                {/* checked (ผ่านแล้ว) */}
                <Block
                    className="
          w-8 h-8
          transition-colors duration-300
          group-hover:bg-white/40
        "
                />

                <Block
                    className="
          w-8 h-8
          transition-colors duration-300 delay-100
          group-hover:bg-white/40
        "
                />

                <Block
                    className="
          w-8 h-8
          transition-colors duration-300 delay-200
          group-hover:bg-white/40
        "
                />

                {/* found */}
                <Block
                    className="
          w-8 h-8
          transition-all duration-300 delay-300
          group-hover:bg-blue-300
          group-hover:scale-110
        "
                />
            </div>
        </div>
    )
}
