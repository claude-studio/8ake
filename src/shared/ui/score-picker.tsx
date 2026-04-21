import { useRef } from 'react'

import { Star } from 'lucide-react'

interface Props {
  value: number
  onChange: (v: number) => void
  max?: number
}

export function ScorePicker({ value, onChange, max = 5 }: Props) {
  const groupRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent, score: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(score + 1, max)
      onChange(next)
      focusButton(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      const prev = Math.max(score - 1, 1)
      onChange(prev)
      focusButton(prev)
    }
  }

  const focusButton = (score: number) => {
    const btn = groupRef.current?.querySelector<HTMLElement>(`[data-score="${score}"]`)
    btn?.focus()
  }

  return (
    <div ref={groupRef} className="flex gap-1" role="radiogroup" aria-label="점수 선택">
      {Array.from({ length: max }, (_, i) => {
        const score = i + 1
        const filled = score <= value
        const isSelected = score === value
        return (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${score}점`}
            data-score={score}
            tabIndex={isSelected || (value === 0 && score === 1) ? 0 : -1}
            onClick={() => onChange(score)}
            onKeyDown={(e) => handleKeyDown(e, score)}
            className="transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
          >
            <Star
              size={22}
              className={filled ? 'text-primary' : 'text-border'}
              fill={filled ? 'var(--primary)' : 'transparent'}
            />
          </button>
        )
      })}
    </div>
  )
}
