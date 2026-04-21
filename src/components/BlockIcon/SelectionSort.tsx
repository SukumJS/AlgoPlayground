import Block from "./Block";

interface Props {
  className?: string;
}

export default function SelectionSortIcon({ className = "" }: Props) {
  return (
    <div
      className={`
        flex items-end justify-center gap-1
        w-32 h-32 pb-15
        group
        ${className}
      `}
    >
      {/* index 0 (ตำแหน่งที่จะ swap) */}
      <Block
        className="
          w-8 h-20
          transition-transform duration-300
          group-hover:translate-x-2
        "
      />

      {/* block ธรรมดา */}
      <Block className="w-8 h-12" />

      {/* min element (ถูกเลือก) */}
      <Block
        className="
          w-8 h-8
          transition-all duration-300
          group-hover:bg-blue-300
          group-hover:scale-110
        "
      />

      {/* block ธรรมดา */}
      <Block className="w-8 h-16" />
    </div>
  );
}
