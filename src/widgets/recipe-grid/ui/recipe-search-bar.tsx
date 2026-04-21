import { Search, X } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface Props {
  search: string
  onSearchChange: (value: string) => void
  sortBy: 'created_at' | 'total_score'
  onSortByChange: (value: 'created_at' | 'total_score') => void
  isSearching?: boolean
}

const SORT_OPTIONS = [
  { value: 'created_at', label: '최신순' },
  { value: 'total_score', label: '평점순' },
] as const

export function RecipeSearchBar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  isSearching,
}: Props) {
  return (
    <div className="flex items-end gap-4">
      {/* Underline search input */}
      <div className="relative flex-1">
        <Search
          size={13}
          className="absolute left-0 bottom-[8px] pointer-events-none text-muted-foreground/50"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="레시피 검색..."
          aria-label="레시피 검색"
          className="w-full bg-transparent border-0 border-b border-border pl-5 pb-2 pr-6 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
        />
        {search.length > 0 && (
          <div className="absolute right-0 bottom-[6px]">
            {isSearching ? (
              <div className="size-3 rounded-full border border-current animate-spin border-t-transparent text-muted-foreground/50" />
            ) : (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                aria-label="검색 초기화"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sort toggle buttons */}
      <div className="flex gap-1 shrink-0 pb-0.5">
        {SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSortByChange(value)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[0.68rem] font-semibold border transition-colors',
              sortBy === value
                ? 'bg-(--primary-dim) border-(--primary-border) text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
