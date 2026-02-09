import AlgorithmCard from "./AlgorithmCard"

interface Item {
  slug: string
  title: string
  shortTitle?: string
  progress: {
    pretest: {
      score: number
      status: "locked" | "active" | "completed"
    }
    posttest: {
      score: number
      status: "locked" | "active" | "completed"
    }
  }
}

interface Props {
  title: string
  items: Item[]
}

export default function AlgorithmSection({ title, items }: Props) {
  return (
    <section className="mb-14">
      <h2 className="mb-6 text-3xl font-bold text-black">
        {title}
      </h2>

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
  )
}
