import Block from "./Block"
interface Props {
    className?: string
}
export default function ArrayIcon({ className = "" }: Props) {
    return (
        <div className={`flex gap-1 ${className}`}>
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="relative flex flex-col items-center w-8">
                    <Block className="w-8 h-8" />
                    {/* number under block */}
                    <span className="mt-1 text-sm text-white/80">
                        {i}
                    </span>
                </div>
            ))}
        </div>
    )
}