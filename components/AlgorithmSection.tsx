import AlgorithmCard from "./AlgorithmCard"

interface Item {
  slug: string
  title: string
  progress: {
    pretest: {
      percent: number
      status: "locked" | "active" | "completed"
    }
    posttest: {
      percent: number
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
    <section className="mb-[60px]">
      <h2 className="mb-[32px] text-[32px] font-bold text-black">
        {title}
      </h2>

      <div className="grid grid-cols-5 gap-[30px]">
        {items.map((item) => (
          <AlgorithmCard
            key={item.slug}
            title={item.title}
            progress={item.progress}
          />
        ))}
      </div>
    </section>
  )
}
