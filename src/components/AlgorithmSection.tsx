import AlgorithmCard from "./AlgorithmCard";
import { TestProgress } from "../data/algorithmCatalog";

interface Props {
  title: string;
  items: TestProgress[];
}

export default function AlgorithmSection({ title, items }: Props) {
  return (
    <section className="mb-14">
      <h2 className="mb-6 text-3xl font-bold text-black">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map((item) => (
          <AlgorithmCard
            key={item.slug}
            slug={item.slug}
            title={item.title}
            shortTitle={item.shortTitle || item.title}
            progress={item.progress}
          />
        ))}
      </div>
    </section>
  );
}
