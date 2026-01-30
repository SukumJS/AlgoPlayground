interface Props {
  className?: string
}

export default function MaxHeapIcon({ className = "" }: Props) {
  return (
    <div className={`flex items-center justify-center h-8 pb-26 ${className}`}>
      <div className="relative w-28 h-20 group">
        {/* edges */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 112 96"
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          <line x1="35" y1="16" x2="-15" y2="64" stroke="white" strokeWidth="1.5" />
          <line x1="75" y1="16" x2="120" y2="64" stroke="white" strokeWidth="1.5" />
          <line x1="5" y1="60" x2="30" y2="96" stroke="white" strokeWidth="1.5" />
          <line x1="-50" y1="120" x2="-12" y2="64" stroke="white" strokeWidth="1.5" />
        </svg>

        {/* root (เล็กกว่า → ลง) */}
        <div
          className="
            absolute top-0 left-1/2 -translate-x-1/2
            w-8 h-8 rounded-full bg-white
            flex items-center justify-center
            text-xs font-semibold text-gray-700
            transition-transform duration-300
            group-hover:translate-y-1
          "
        >
          20
        </div>

        {/* child ที่ใหญ่กว่า (ขึ้น) */}
        <div
          className="
            absolute bottom-4 right-12
            w-8 h-8 rounded-full bg-blue-400
            flex items-center justify-center
            text-xs font-semibold text-white
            transition-transform duration-300
            group-hover:-translate-y-2
            group-hover:scale-105
          "
        >
          30
        </div>

        {/* node อื่นนิ่ง */}
        <div
          className="
            absolute bottom-4 left-12
            w-8 h-8 rounded-full bg-white
            flex items-center justify-center
            text-xs font-semibold text-gray-400
          "
        >
          10
        </div>

        <div
          className="
            absolute -bottom-4 left-2
            w-8 h-8 rounded-full bg-white
            flex items-center justify-center
            text-xs font-semibold text-gray-400
          "
        >
          5
        </div>

        <div
          className="
            absolute -bottom-4 right-18
            w-8 h-8 rounded-full bg-white
            flex items-center justify-center
            text-xs font-semibold text-gray-400
          "
        >
          8
        </div>
      </div>
    </div>
  )
}
