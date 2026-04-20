import { useCallback, useState } from 'react'

import { Link } from '@tanstack/react-router'
import { ImageOff, Plus, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useRecipes } from '@/entities/recipe'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer'

import { RecipeCard, rotations } from './recipe-card'
import { RecipeSearchBar } from './recipe-search-bar'
import { TagFilterBar } from './tag-filter-bar'

interface RecipeGridProps {
  initialTag?: string
}

export function RecipeGrid({ initialTag }: RecipeGridProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'total_score'>('created_at')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : [])

  const debouncedSearch = useDebouncedValue(search, 300)

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [])

  const clearTags = useCallback(() => setSelectedTags([]), [])

  const { items, isLoading, isFetching, isError, isFetchingMore, hasNextPage, fetchMore, refetch } =
    useRecipes(debouncedSearch, sortBy, selectedTags.length > 0 ? selectedTags : undefined)

  const isSearchPending = search !== debouncedSearch

  const sentinelRef = useIntersectionObserver(() => {
    if (hasNextPage && !isFetchingMore) {
      fetchMore()
    }
  })

  const hasFilters = Boolean(debouncedSearch) || selectedTags.length > 0

  return (
    <div className="py-6">
      <RecipeSearchBar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        isSearching={isSearchPending || (isFetching && !isLoading)}
      />

      <TagFilterBar selectedTags={selectedTags} onToggleTag={toggleTag} onClearTags={clearTags} />

      {/* Loading skeleton — polaroid shaped */}
      {isLoading && (
        <div className="grid grid-cols-1 min-[475px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card border border-border px-2 pt-2 pb-4 animate-pulse shadow-(--shadow-card)"
              style={{ transform: `rotate(${rotations[i % rotations.length]}deg)` }}
            >
              <div className="w-full aspect-4/3 rounded-[6px] bg-surface" />
              <div className="mt-3 px-1 space-y-2">
                <div className="h-3 bg-surface rounded-full w-3/4" />
                <div className="h-2 bg-surface rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div className="flex min-h-[calc(100dvh-var(--header-h)-var(--tabbar-h)-var(--safe-bottom)-8rem)] flex-col items-center justify-center gap-4 text-center">
          <p className="text-[0.95rem] font-bold text-foreground">레시피를 불러오지 못했어요</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCcw size={13} />
            다시 시도
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="flex min-h-[calc(100dvh-var(--header-h)-var(--tabbar-h)-var(--safe-bottom)-8rem)] flex-col items-center justify-center gap-6">
          {/* Blank polaroid decoration */}
          <div
            className="relative w-28 h-36 bg-card border border-border rounded-xl flex flex-col shadow-(--shadow-card)"
            style={{ transform: 'rotate(-2.5deg)' }}
          >
            <div className="flex-1 mx-2 mt-2 rounded-[4px] bg-surface flex items-center justify-center">
              <ImageOff size={20} className="text-muted-foreground opacity-20" strokeWidth={1.5} />
            </div>
            <div className="py-2.5 text-center">
              <div className="h-1.5 bg-surface rounded-full w-12 mx-auto mb-1" />
              <div className="h-1.5 bg-surface rounded-full w-8 mx-auto opacity-50" />
            </div>
          </div>

          <div className="text-center">
            {hasFilters ? (
              <>
                <p className="text-[0.95rem] font-bold text-foreground">검색 결과가 없어요</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    clearTags()
                  }}
                  className="mt-2 text-sm text-primary font-medium underline underline-offset-2"
                >
                  필터 초기화
                </button>
              </>
            ) : (
              <>
                <p className="text-[0.95rem] font-bold text-foreground">아직 기록이 없어요</p>
                <p className="text-sm text-muted-foreground mt-0.5">첫 레시피를 아카이브해보세요</p>
                <Button asChild size="sm" className="mt-4">
                  <Link to="/recipe/new">
                    <Plus size={14} />
                    레시피 추가
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recipe count + grid */}
      {!isLoading && !isError && items.length > 0 && (
        <>
          <p className="text-xs tracking-wide font-medium text-muted-foreground mb-3.5 mt-4 pl-0.5">
            <span className="font-bold text-primary">{items.length}</span>
            개의 레시피
          </p>
          <div className="grid grid-cols-1 min-[475px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                name={recipe.name}
                tags={recipe.tags}
                totalScore={recipe.total_score}
                sourceType={recipe.source_type}
                createdAt={recipe.created_at}
                photos={recipe.recipe_photos}
                index={index}
              />
            ))}
          </div>
        </>
      )}

      {/* Infinite scroll sentinel */}
      {hasNextPage && (
        <div ref={sentinelRef} className="h-10 mt-4">
          {isFetchingMore && (
            <div className="flex justify-center">
              <div className="size-6 rounded-full border-2 animate-spin border-border border-t-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
