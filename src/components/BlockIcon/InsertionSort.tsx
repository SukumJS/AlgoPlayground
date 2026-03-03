import Block from "./Block";

interface Props {
  className?: string;
}

export default function InsertionSortIcon({ className = "" }: Props) {
  return (
    <div
      className={`
        flex items-end justify-center gap-1
        w-32 h-32 pb-15
        group
        ${className}
      `}
    >
      {/* sorted part (นิ่ง) */}

      <Block className="w-8 h-14" />

      {/* key element (ถูกยกออกมา) */}
      <Block
        className="
          w-8 h-8
          transition-all duration-300 ease-in-out
          group-hover:bg-blue-300
          group-hover:-translate-y-4
        "
      />

      {/* elements ที่ถูกดันขวา */}
      <Block
        className="
          w-8 h-12
          transition-transform duration-300
          group-hover:translate-x-2
        "
      />

      <Block className="w-8 h-18" />
    </div>
  );
}
