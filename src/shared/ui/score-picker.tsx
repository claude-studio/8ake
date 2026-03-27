import { Star } from 'lucide-react'

interface Props {
  value: number
  onChange: (v: number) => void
  max?: number
}

export function ScorePicker({ value, onChange, max = 5 }: Props) {
  return (
    <div className="flex gap-1" role="radiogroup">
      {Array.from({ length: max }, (_, i) => {
        const score = i + 1
        const filled = score <= value
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={filled}
            aria-label={`${score}점`}
            onClick={() => onChange(score)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={22}
              className={filled ? 'text-[var(--primary)]' : 'text-[var(--border)]'}
              fill={filled ? 'var(--primary)' : 'transparent'}
            />
          </button>
        )
      })}
    </div>
  )
}
