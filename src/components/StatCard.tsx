export default function StatCard({
  title,
  value,
  desc,
}: {
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm text-black">{title}</p>
      <p className="text-2xl font-bold text-black">{value}</p>
      <p className="text-xs text-black mt-1">{desc}</p>
    </div>
  );
}
