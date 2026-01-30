// components/AlgorithmIcon.tsx
import { BlockIcon } from "./BlockIcon/BlockIcon"
import { algorithmVisualMap } from "../config/algorithmVisual"
import type { Status } from "../data/algorithmCatalog"

interface Props {
  slug: string
  status: Status
  className?: string
}

export function AlgorithmIcon({ slug, className }: Props) {
  const visual =
    algorithmVisualMap[slug as keyof typeof algorithmVisualMap]

  if (!visual) return null

  return (
    <BlockIcon
      pattern={visual.pattern}
      className={className}
    />
  )
}
