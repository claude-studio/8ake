import { Star } from 'lucide-react'

interface Props {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 22,
}

export function CupcakeScore({ value, max = 5, size = 'md' }: Props) {
  const px = sizeMap[size]
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value}점 / ${max}점`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={px}
          className={i < value ? 'text-primary' : 'text-(--border)'}
          fill={i < value ? 'var(--primary)' : 'transparent'}
        />
      ))}
    </span>
  )
}
