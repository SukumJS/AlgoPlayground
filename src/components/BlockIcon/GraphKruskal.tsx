interface Props {
    className?: string
}

export default function GraphKruskalIcon({ className = "" }: Props) {
    return (
        <div className={`relative w-24 h-24 ${className}`}>
            {/* edges */}
            <svg className="absolute inset-[-32px] pointer-events-none"
                viewBox="-32 -32 128 128">
                <line x1="25" y1="-25" x2="-25" y2="10" className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-0" />
                <text
                    x="0"
                    y="-15"
                    textAnchor="middle"
                    className="fill-white text-[10px] "
                >
                    1
                </text>
                <line x1="10" y1="-50" x2="80" y2="0" className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-0" />
                <text
                    x="60"
                    y="-20"
                    textAnchor="middle"
                    className="fill-white text-[10px]"
                >
                    1
                </text>
                <line x1="30" y1="-80" x2="30" y2="40" className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-0" />
                <text
                    x="35"
                    y="8"
                    textAnchor="middle"
                    className="fill-white text-[10px]"
                >
                    1
                </text>
                <line x1="35" y1="40" x2="-5" y2="15" className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-0" />
                <text
                    x="0"
                    y="35"
                    textAnchor="middle"
                    className="fill-white text-[10px]"
                >
                    3
                </text>
                <line x1="35" y1="35" x2="80" y2="40" className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-0" />
                <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    className="fill-white text-[10px]"
                >
                    1
                </text>
                <line x1="90" y1="-10" x2="80" y2="30" className="stroke-white" />
                <text
                    x="90"
                    y="25"
                    textAnchor="middle"
                    className="fill-white text-[10px]"
                >
                    2
                </text>
            </svg>

            {/* nodes */}
            <div className="absolute -top-10 w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-200" />

            <div
                className="absolute -left-6 top-0 w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-600"></div>
            <div className="absolute left-6 top-8  w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-0" />
            <div className="absolute left-25 -top-2  w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-800" />

            <div className="absolute left-22 top-10 w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-400"></div>
        </div>
    )

}
