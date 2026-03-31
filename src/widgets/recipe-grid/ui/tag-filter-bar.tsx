import { X } from 'lucide-react'

import { usePopularTags } from '@/entities/tag'
import { cn } from '@/shared/lib/utils'

interface Props {
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClearTags: () => void
}

export function TagFilterBar({ selectedTags, onToggleTag, onClearTags }: Props) {
  const { data: popularTags, isLoading } = usePopularTags()

  if (isLoading || !popularTags || popularTags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-3">
      {selectedTags.length > 0 && (
        <button
          type="button"
          onClick={onClearTags}
          className="inline-flex items-center gap-0.5 rounded-full border border-destructive/40 bg-destructive/5 px-2.5 py-1 text-[0.7rem] font-medium text-destructive transition-colors"
        >
          <X size={11} />
          초기화
        </button>
      )}
      {popularTags.map(({ tag, count }) => {
        const isActive = selectedTags.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggleTag(tag)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-surface text-muted-foreground'
            )}
          >
            #{tag}
            <span
              className={cn(
                'text-[0.6rem]',
                isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/60'
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
