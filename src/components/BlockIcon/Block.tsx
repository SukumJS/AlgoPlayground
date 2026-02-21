interface Props {
  className?: string
}

export default function Block({ className = "" }: Props) {
  return <div className={`bg-white rounded-sm ${className}`} />
}
