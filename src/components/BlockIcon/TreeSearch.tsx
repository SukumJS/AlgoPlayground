interface Props {
  className?: string;
}

export default function TreeSearchIcon({ className = "" }: Props) {
  return (
    <div className={`flex items-center justify-center h-8 pb-26 ${className}`}>
      <div className="relative w-28 h-20">
        {/* edges */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 112 96"
          width="100%"
          height="100%"
          style={{ overflow: "visible" }}
        >
          <line
            x1="35"
            y1="16"
            x2="-15"
            y2="64"
            stroke="white"
            strokeWidth="1.5"
          />
          <line
            x1="75"
            y1="16"
            x2="120"
            y2="64"
            stroke="white"
            strokeWidth="1.5"
          />
          <line
            x1="5"
            y1="60"
            x2="30"
            y2="96"
            stroke="white"
            strokeWidth="1.5"
          />
          <line
            x1="-50"
            y1="120"
            x2="-12"
            y2="64"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>

        {/* node: top (เริ่มก่อน) */}
        <div
          className="
    absolute top-0 left-1/2 -translate-x-1/2
    w-8 h-8 rounded-full bg-white
    transition-all duration-300 delay-0
    group-hover:bg-blue-300
    group-hover:scale-110
  "
        />

        {/* layer 2 */}
        <div
          className="
          absolute bottom-4 left-12
          w-8 h-8 rounded-full
          bg-white
        "
        />
        <div
          className="
          absolute bottom-4 right-12
          w-8 h-8 rounded-full
          bg-white
          transition-colors duration-300 delay-100
          group-hover:bg-blue-300
          group-hover:scale-110
          
        "
        />

        {/* layer 3  */}
        <div
          className="
          absolute -bottom-4 right-18
          w-8 h-8 rounded-full
          bg-white
        "
        />
        <div
          className="
          absolute -bottom-4 left-2
          w-8 h-8 rounded-full
          bg-white
          transition-colors duration-300 delay-400
          group-hover:bg-blue-300 group-hover:scale-110 
          group-hover:ring-2 group-hover:ring-blue-200 delay-200
        "
        />
      </div>
    </div>
  );
}
