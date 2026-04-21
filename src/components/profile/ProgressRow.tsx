export default function ProgressRow({
  item,
}: {
  item: { name: string; current: number; total: number };
}) {
  const percent = Math.round((item.current / item.total) * 100);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-black">{item.name}</span>
        <span className="text-black">
          {item.current}/{item.total}
        </span>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div
          className="h-2 bg-blue-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
