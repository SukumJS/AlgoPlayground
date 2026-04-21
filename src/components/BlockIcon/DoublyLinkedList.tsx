interface Props {
  className?: string;
}

export default function DoublyLinkedListIcon({ className = "" }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {["A", "B", "C"].map((v) => (
        <div key={v} className="flex">
          <div className="w-4 h-8 border border-white border-r-0" />
          <div className="w-8 h-8 border border-white flex items-center justify-center text-xs text-white">
            {v}
          </div>
          <div className="w-4 h-8 border border-white border-l-0" />
        </div>
      ))}
    </div>
  );
}
