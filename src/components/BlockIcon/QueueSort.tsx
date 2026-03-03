import Block from "./Block";

interface Props {
  className?: string;
}

export default function QueueSortIcon({ className = "" }: Props) {
  return (
    <div
      className={`
        flex items-end justify-center gap-1
        w-32 h-32 pb-15
        group
        ${className}
      `}
    >
      {/* head (dequeue) */}
      <Block
        className="
          w-8 h-20
          transition-all duration-300
          group-hover:-translate-y-4
          group-hover:opacity-0
        "
      />

      {/* middle */}
      <Block className="w-8 h-10" />
      <Block className="w-8 h-14" />

      {/* tail (enqueue) */}
      <Block
        className="
          w-8 h-8
          opacity-0
          transition-all duration-300
          group-hover:opacity-100
          group-hover:translate-x-2
        "
      />
    </div>
  );
}
