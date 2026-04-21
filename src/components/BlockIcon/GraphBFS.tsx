interface Props {
  className?: string;
}

export default function GraphBFSIcon({ className = "" }: Props) {
  return (
    <div className={`relative w-24 h-24 ${className}`}>
      {/* edges */}
      <svg
        className="absolute inset-[-32px] pointer-events-none"
        viewBox="-32 -32 128 128"
      >
        <line
          x1="25"
          y1="-25"
          x2="-25"
          y2="10"
          className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-0"
        />
        <line
          x1="10"
          y1="-50"
          x2="80"
          y2="0"
          className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-0"
        />
        <line
          x1="35"
          y1="40"
          x2="-5"
          y2="15"
          className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-200"
        />
        <line
          x1="35"
          y1="35"
          x2="80"
          y2="40"
          className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-200"
        />
        <line
          x1="90"
          y1="-10"
          x2="80"
          y2="30"
          className="stroke-white group-hover:stroke-blue-300 transition-colors duration-300 delay-300"
        />
      </svg>

      {/* nodes */}
      <div className="absolute -top-10 w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-200" />

      <div className="absolute -left-6 top-0  w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-0" />

      <div className="absolute left-6 top-8  w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-200" />

      <div className="absolute left-25 -top-2  w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-300" />

      <div className="absolute left-22 top-10  w-8 h-8 rounded-full bg-white group-hover:bg-blue-300 transition-colors delay-300" />
    </div>
  );
}
