import Block from "./Block";

interface Props {
  className?: string;
}

export default function MergeSortIcon({ className = "" }: Props) {
  return (
    <div
      className={`
        flex items-end justify-center gap-1
        w-32 h-32 pb-15
        group
        ${className}
      `}
    >
      {/* left group */}
      <Block
        className="
          w-8 h-12
          transition-transform duration-300
          group-hover:-translate-x-4
        "
      />
      <Block
        className="
          w-8 h-16
          transition-transform duration-300
          group-hover:-translate-x-4
        "
      />

      {/* right group */}
      <Block
        className="
          w-8 h-8
          transition-transform duration-300
          group-hover:translate-x-4
        "
      />
      <Block
        className="
          w-8 h-20
          transition-transform duration-300
          group-hover:translate-x-4
        "
      />
    </div>
  );
}
